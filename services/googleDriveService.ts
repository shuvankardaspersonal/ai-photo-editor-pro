
declare const gapi: any;

const GOOGLE_API_KEY = process.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

let gapiInitialized = false;

// Function to load and initialize the GAPI client
const initializeGapiClient = (accessToken: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (gapiInitialized) {
            gapi.client.setToken({ access_token: accessToken });
            return resolve();
        }
        
        gapi.load('client', async () => {
            try {
                await gapi.client.init({
                    apiKey: GOOGLE_API_KEY,
                    clientId: GOOGLE_CLIENT_ID,
                    discoveryDocs: DISCOVERY_DOCS,
                });
                gapi.client.setToken({ access_token: accessToken });
                gapiInitialized = true;
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
};

// Converts a base64 string to a Blob
const base64ToBlob = (base64: string, contentType: string = ''): Blob => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
};

export const uploadToDrive = async (
    editedImageBase64Url: string,
    fileName: string,
    accessToken: string
): Promise<void> => {
    try {
        await initializeGapiClient(accessToken);
        
        const [meta, base64] = editedImageBase64Url.split(',');
        const mimeType = meta.match(/:(.*?);/)?.[1] || 'image/png';
        
        const fileBlob = base64ToBlob(base64, mimeType);

        const metadata = {
            name: fileName,
            mimeType: mimeType,
            parents: ['appDataFolder'] // Or use 'root' to save in the main drive folder
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', fileBlob);

        const response = await gapi.client.request({
            path: 'https://www.googleapis.com/upload/drive/v3/files',
            method: 'POST',
            params: { uploadType: 'multipart' },
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: form,
        });

        if (response.status !== 200) {
            throw new Error(`Google Drive API responded with status ${response.status}`);
        }
        
        console.log('File uploaded successfully:', response.result);

    } catch (error) {
        console.error('Error uploading to Google Drive:', error);
        throw error;
    }
};