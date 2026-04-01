export const connectToSolutium = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
        try {
            const cleanToken = decodeURIComponent(token);
            // El nuevo formato es base64Payload.signature
            const [base64Payload] = cleanToken.split('.'); 

            if (!base64Payload) throw new Error('Formato de token inválido');

            // Decodificación robusta y segura para caracteres UTF-8 (tildes, eñes)
            const decodedString = decodeURIComponent(Array.prototype.map.call(window.atob(base64Payload), function(c: any) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(decodedString);
            return payload;
        } catch (e) {
            console.error("Error decodificando token de Solutium", e);
            return null;
        }
    }
    return null;
};

export const sendSaveToMother = (data: any) => {
    if (window.opener) {
        window.opener.postMessage({
            type: 'SOLUTIUM_SAVE',
            payload: { data, timestamp: Date.now() }
        }, '*');
    }
};
