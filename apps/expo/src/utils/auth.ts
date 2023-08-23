

export const isValidPhone = (phoneNumber: string): [boolean, string] => {
    let error = '';
    if (phoneNumber.length !== 8) {
        error = '¿Por qué su numero no tiene 8 cifras? 🤨'
        return [false, error];
    }

    if (!phoneNumber.startsWith('5')) {
        error = 'Su número no comienza por 5 😐'
        return [false, error];
    }

    for (let i = 0; i < phoneNumber.length; i++) {
        if (isNaN(Number(phoneNumber.charAt(i)))) {
            error = 'Todos los caractéres deben ser números 🤌, sobra el: "' + phoneNumber.charAt(i) + '"'
            return [false, error];
        }
    }

    return [true, ""];
}

export const isValidPassword = (password: string): [boolean, string] => {
    let error = '';

    if (password.length < 8) {
        error = 'Su contraseña debe tener al menos 8 caracteres  😐'
        return [false, error];
    }

    if (password.length > 20) {
        error = 'Su contraseña no debe tener más de 20 caracteres 😐'
        return [false, error];
    }

    return [true, ""];
}

export const isValidUsername = (username: string): [boolean, string] => {
    let error = '';

    if (username.length < 3) {
        error = 'Su nombre de usuario debe tener al menos 3 caracteres 😐'
        return [false, error];
    }

    if (username.length > 20) {
        error = 'Su nombre de usuario no debe tener más de 20 caracteres 😐'
        return [false, error];
    }

    return [true, ""];
}

export const usernameToSlug = (username: string) => {
    return username.toLowerCase().replace(/ /g, '-');
}