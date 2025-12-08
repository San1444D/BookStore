// utils/imageHelper.js - NEW FILE
export const getBookImage = (
  itemImage,
  fallbackSize = "w_100,h_150,c_fill"
) => {
  if (!itemImage) {
    // Cloudinary placeholder
    return `https://res.cloudinary.com/demo/image/upload/${fallbackSize}/book-placeholder.jpg`;
  }

  // If already Cloudinary URL, return as-is
  if (itemImage.includes("cloudinary")) {
    return itemImage;
  }

  // Local file - generate Cloudinary transformation
  return `https://res.cloudinary.com/demo/image/upload/${fallbackSize}/${itemImage}`;
};
