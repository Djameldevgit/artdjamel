const axios = require('axios');
const Users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendMail = require('./sendMail');
const sendCustomEmail = require('./sendCustomEmail');
const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const { CLIENT_URL } = process.env;

const client = new OAuth2(process.env.GOOGLE_CLIENT_ID);

const createActivationToken = (payload) => {
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, { expiresIn: '5m' });
};

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
};

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
};

const authCtrl = {
    // ==================== INSCRIPTION ====================
    register: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            // Validations
            if (!username || !email || !password) {
                return res.status(400).json({ msg: "Veuillez remplir tous les champs." });
            }

            let newUserName = username.toLowerCase().replace(/ /g, '');

            const user_name = await Users.findOne({ username: newUserName });
            if (user_name) return res.status(400).json({ msg: "Ce nom d'utilisateur existe déjà." });

            const user_email = await Users.findOne({ email });
            if (user_email) return res.status(400).json({ msg: "Cet email existe déjà." });

            if (password.length < 6) {
                return res.status(400).json({ msg: "Le mot de passe doit contenir au moins 6 caractères." });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            const newUser = new Users({
                username: newUserName,
                email,
                password: passwordHash
            });

            const access_token = createAccessToken({ id: newUser._id });
            const refresh_token = createRefreshToken({ id: newUser._id });

            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path: '/api/refresh_token',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
            });

            await newUser.save();

            res.json({
                msg: 'Inscription réussie !',
                access_token,
                user: {
                    ...newUser._doc,
                    password: ''
                }
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // ==================== CONNEXION ====================
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await Users.findOne({ email })
                .populate("followers following", "avatar username followers following");

            if (!user) return res.status(400).json({ msg: "Cet email n'existe pas." });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ msg: "Mot de passe incorrect." });

            const access_token = createAccessToken({ id: user._id });
            const refresh_token = createRefreshToken({ id: user._id });

            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path: '/api/refresh_token',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
            });

            res.json({
                msg: 'Connexion réussie !',
                access_token,
                user: {
                    ...user._doc,
                    password: ''
                }
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // ==================== ENVOYER EMAIL D'ACTIVATION ====================
    sendActivationEmail: async (req, res) => {
        try {
            const user = await Users.findById(req.user._id);
            if (!user) {
                return res.status(400).json({ msg: "Utilisateur non trouvé." });
            }

            if (user.isVerified) {
                return res.status(400).json({ msg: "Compte déjà vérifié." });
            }

            const activation_token = createActivationToken({ id: user._id });
            const url = `${CLIENT_URL}/user/activate/${activation_token}`;

            await sendMail(user.email, url, 'fr', 'activation');

            res.json({ msg: "Email d'activation envoyé. Vérifiez votre boîte de réception." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // ==================== ACTIVATION DU COMPTE ====================
    activationAccount: async (req, res) => {
        try {
            const { activation_token } = req.body;
            const decoded = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN_SECRET);
            const { id } = decoded;

            const user = await Users.findById(id);
            if (!user) return res.status(400).json({ msg: "Utilisateur non trouvé." });

            if (user.isVerified) {
                return res.status(400).json({ msg: "Compte déjà vérifié." });
            }

            user.isVerified = true;
            await user.save();

            res.json({
                msg: "Compte activé avec succès !",
                user
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // ==================== ALTERNER VÉRIFICATION (ADMIN) ====================
    toggleVerification: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await Users.findById(id);
            if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé." });

            user.isVerified = !user.isVerified;
            await user.save();

            res.json({
                msg: `L'utilisateur est maintenant ${user.isVerified ? "vérifié ✅" : "non vérifié ❌"}`,
                user,
            });
        } catch (err) {
            return res.status(500).json({ msg: "Erreur serveur." });
        }
    },

    // ==================== MOT DE PASSE OUBLIÉ ====================
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            const user = await Users.findOne({ email });
            if (!user) {
                return res.status(400).json({ msg: "Cet email n'existe pas." });
            }

            const access_token = createAccessToken({ id: user._id });
            const url = `${CLIENT_URL}/user/reset/${access_token}`;

            await sendMail(user.email, url, 'fr', 'reset');

            res.json({ msg: "Email de réinitialisation envoyé. Vérifiez votre boîte de réception." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // ==================== RÉINITIALISER MOT DE PASSE ====================
    resetPassword: async (req, res) => {
        try {
            const { password } = req.body;
            const passwordHash = await bcrypt.hash(password, 12);

            await Users.findOneAndUpdate(
                { _id: req.user.id },
                { password: passwordHash }
            );

            res.json({ msg: "Mot de passe changé avec succès." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // ==================== ENVOYER EMAILS AUX UTILISATEURS ====================
    sendEmailsParaUsers: async (req, res) => {
        try {
            const { recipients, subject, message, url } = req.body;
            const lang = 'fr';

            if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
                return res.status(400).json({ msg: 'Aucun destinataire sélectionné.' });
            }

            if (!subject || !message) {
                return res.status(400).json({ msg: 'Sujet ou message manquant.' });
            }

            const users = await Users.find({ _id: { $in: recipients } });
            const emails = users.map(user => user.email);

            for (const email of emails) {
                await sendMail(email, url || '#', lang, 'informativo', subject, message);
            }

            return res.json({ msg: `✅ Emails envoyés à ${emails.length} utilisateurs.` });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // ==================== LOGIN GOOGLE ====================
    googleLogin: async (req, res) => {
        try {
            const { tokenId } = req.body;

            const verify = await client.verifyIdToken({
                idToken: tokenId,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            const { email_verified, email, name, picture } = verify.payload;

            if (!email_verified) {
                return res.status(400).json({ msg: "Échec de la vérification email." });
            }

            const password = email + process.env.GOOGLE_SECRET;
            const passwordHash = await bcrypt.hash(password, 12);

            let user = await Users.findOne({ email });

            if (user) {
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(400).json({ msg: "Mot de passe incorrect." });
                }
                if (!user.isVerified) {
                    user.isVerified = true;
                    await user.save();
                }
            } else {
                const username = email.split("@")[0].toLowerCase().replace(/\s/g, '');

                user = new Users({
                    name,
                    username,
                    email,
                    password: passwordHash,
                    avatar: picture,
                    isVerified: true
                });

                await user.save();
            }

            const access_token = createAccessToken({ id: user._id });
            const refresh_token = createRefreshToken({ id: user._id });

            res.cookie("refreshtoken", refresh_token, {
                httpOnly: true,
                path: "/api/refresh_token",
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
            });

            res.json({
                msg: "Connexion réussie !",
                access_token,
                user: {
                    ...user._doc,
                    password: ''
                }
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // ==================== LOGIN FACEBOOK ====================
    facebookLogin: async (req, res) => {
        try {
            const { accessToken, userID } = req.body;

            const URL = `https://graph.facebook.com/v2.9/${userID}?fields=id,name,email,picture&access_token=${accessToken}`;
            const response = await axios.get(URL);

            const { email, name, picture } = response.data;

            if (!email) {
                return res.status(400).json({ msg: "Votre compte Facebook n'a pas d'email confirmé." });
            }

            const password = email + process.env.FACEBOOK_SECRET;
            const passwordHash = await bcrypt.hash(password, 12);

            let user = await Users.findOne({ email });

            if (user) {
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) return res.status(400).json({ msg: "Authentification échouée." });

                if (!user.isVerified) {
                    user.isVerified = true;
                    await user.save();
                }
            } else {
                const username = email.split("@")[0].toLowerCase().replace(/\s/g, '');

                user = new Users({
                    name,
                    username,
                    email,
                    password: passwordHash,
                    avatar: picture.data.url,
                    isVerified: true
                });

                await user.save();
            }

            const access_token = createAccessToken({ id: user._id });
            const refresh_token = createRefreshToken({ id: user._id });

            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path: '/api/refresh_token',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
            });

            res.json({
                msg: "Connexion réussie !",
                access_token,
                user: {
                    ...user._doc,
                    password: ''
                }
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: "Erreur serveur lors de la connexion avec Facebook." });
        }
    },

    // ==================== DÉCONNEXION ====================
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshtoken', { path: '/api/refresh_token' });
            return res.json({ msg: "Déconnexion réussie." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // ==================== GÉNÉRER TOKEN D'ACCÈS ====================
    generateAccessToken: async (req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken;
            if (!rf_token) {
                return res.status(400).json({ msg: "Veuillez vous connecter." });
            }

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, async (err, result) => {
                if (err) {
                    return res.status(400).json({ msg: "Session expirée. Veuillez vous reconnecter." });
                }

                const user = await Users.findById(result.id).select("-password")
                    .populate('followers following', 'avatar username followers following');

                if (!user) {
                    return res.status(400).json({ msg: "Utilisateur non trouvé." });
                }

                const access_token = createAccessToken({ id: result.id });

                res.json({
                    access_token,
                    user
                });
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = authCtrl;