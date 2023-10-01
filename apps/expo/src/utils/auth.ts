

export const isValidPhone = (phoneNumber: string, errors = {
    length: {
        active: true,
        message: "¿Por qué su numero no tiene <value> cifras? 🤨",
        value: 8
    },
    startsWith: {
        active: true,
        message: "Su número debe comenzar con 5 😐",
        value: "5"
    },
    invalidChars: {
        active: true,
        message: "Todos los caractéres deben ser números 🤌, sobra el: <value>",
        withInvalid: true
    },
}): [boolean, string] => {
    if ((phoneNumber.length !== errors.length.value) && errors.length.active) {
        return [false, errors.length.message.replace("<value>", errors.length.value.toString())];
    }

    if (!phoneNumber.startsWith(errors.startsWith.value) && errors.startsWith.active) {
        return [false, errors.startsWith.message.replace("<value>", errors.startsWith.value.toString())];
    }

    if (errors.startsWith.active) {
        for (let i = 0; i < phoneNumber.length; i++) {
            if (isNaN(Number(phoneNumber.charAt(i)))) {
                if (errors.invalidChars.withInvalid) {
                    return [false, errors.invalidChars.message.replace("<value>", phoneNumber.charAt(i))];
                } else {
                    return [false, errors.invalidChars.message];
                }
            }
        }
    }

    return [true, ""];
}

export const isValidPassword = (password: string, errors = {
    maxLength: {
        active: true,
        message: "Su contraseña no debe tener más de <value> caracteres 😐",
        value: 8
    },
    minLength: {
        active: true,
        message: "Su contraseña no debe exeder los <value> caracteres 😐",
        value: 20
    }
}): [boolean, string] => {
    if ((password.length > errors.maxLength.value) && errors.maxLength.active) {
        return [false, errors.maxLength.message.replace("<value>", errors.maxLength.value.toString())];
    }

    if ((password.length < errors.minLength.value) && errors.minLength.active) {
        return [false, errors.minLength.message.replace("<value>", errors.minLength.value.toString())];
    }

    return [true, ""];
}

export const isValidUsername = (username: string, errors = {
    maxLength: {
        active: true,
        message: "Su nombre de usuario no debe tener más de <value> caracteres 😐",
        value: 8
    },
    minLength: {
        active: true,
        message: "Su nombre de usuario no debe exeder los <value> caracteres 😐",
        value: 20
    },
    onlyAlphanumerics: {
        active: true,
        message: "Su nombre de usuario solo puede contener caracteres alfanuméricos 😐",
    },
}): [boolean, string] => {
    if ((username.length > errors.maxLength.value) && errors.maxLength.active) {
        return [false, errors.maxLength.message.replace("<value>", errors.maxLength.value.toString())];
    }
    if ((username.length < errors.minLength.value) && errors.minLength.active) {
        return [false, errors.minLength.message.replace("<value>", errors.minLength.value.toString())];
    }
    if (!/^[a-zA-Z0-9]+$/.test(username) && errors.onlyAlphanumerics.active) {
        return [false, errors.onlyAlphanumerics.message];
    }

    return [true, ""];
}