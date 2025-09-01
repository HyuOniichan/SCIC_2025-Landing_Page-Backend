import ImageKit from "imagekit";

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || ""
});

export const uploadFileToImageKit = async (
  file: Buffer,
  fileName: string,
  folder: string = "/"
): Promise<{ url: string; fileId: string }> => {
  const res = await imagekit.upload({
    file,
    fileName,
    folder,
  });
  console.log(res.fileId)
  return { url: res.url, fileId: res.fileId };
};

export const deleteFileFromImageKit = async (fileId: string): Promise<void> => {
  await imagekit.deleteFile(fileId);
};
