import { api_url } from "@/utils/fetch-url"
 

export async function uploadImage(file: File): Promise<string | null> {
  if (!file) {
    console.error("Nenhum arquivo fornecido.")
    return null
  }

  try {
    const formData = new FormData()
    formData.append("image", file)

    const response = await fetch(`${api_url}/api/upload`, {
      method: "POST",
      body: formData, 
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Erro no upload: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.url) {
      console.error("A resposta não contém a URL da imagem:", data)
      return null
    }

    return data.url
  } catch (error) {
    console.error("Erro ao enviar imagem:", error)
    return null
  }
}
