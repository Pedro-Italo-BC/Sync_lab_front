export async function validadeImage(defaultUrl: string, url: string): Promise<string> {
    return await new Promise(resolve => {
        const image = new Image();
        image.onload = () => resolve(url);
        image.onerror = () => resolve(defaultUrl);
        image.src = url;
    })
}