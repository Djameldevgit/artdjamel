const validatePostData = (data) => {
    const errors = [];

    // ✅ VALIDACIONES GENERALES (para todas las categorías)
    if (!data.images || data.images.length === 0) {
        errors.push("Veuillez ajouter au moins une photo.");
    }

    if (!data.category) {
        errors.push("La catégorie est requise.");
    }

   /* if (!data.subCategory) {
        errors.push("La sous-catégorie est requise.");
    }*/

    if (!data.title || data.title.trim().length < 5) {
        errors.push("Le titre doit contenir au moins 5 caractères.");
    }

    if (!data.price || data.price <= 0) {
        errors.push("Le prix doit être supérieur à 0.");
    }

    // ✅ VALIDACIONES ESPECÍFICAS POR CATEGORÍA
    if (data.category === 'vetements') {
        if (!data.genero) {
            errors.push("Le genre est requis pour les vêtements.");
        }
    }

    if (data.category === 'telefonos') {
        if (!data.marca) {
            errors.push("La marque est requise pour les téléphones.");
        }
    }

    if (data.category === 'vehiculos') {
        if (!data.kilometraje) {
            errors.push("Le kilométrage est requis pour les véhicules.");
        }
    }

    // Agregar validaciones para las otras 10 categorías...

    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = { validatePostData };