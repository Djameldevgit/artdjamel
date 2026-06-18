const valid = (data, isLogin = false) => {
    const { username, email, password, cf_password } = data;
    const err = {};
    
    // Validaciones para email
    if (!email) {
        err.email = 'validation.email.required';
    } else if (!validateEmail(email)) {
        err.email = 'validation.email.format';
    }

    // Validaciones para password
    if (!password) {
        err.password = 'validation.password.required';
    } else if (!isLogin && password.length < 6) {
        err.password = 'validation.password.length';
    }

    // Validaciones solo para register
    if (!isLogin) {
        if (!username) {
            err.username = 'validation.username.required';
        } else if (username.replace(/ /g, '').length > 25) {
            err.username = 'validation.username.length';
        }

        if (password !== cf_password) {
            err.cf_password = 'validation.cf_password.mismatch';
        }
    }

    return {
        errMsg: err,
        errLength: Object.keys(err).length,
    };
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export default valid;