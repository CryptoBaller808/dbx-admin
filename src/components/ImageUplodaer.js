import React, { useState } from 'react';
import ImageUploading from 'react-images-uploading';
import "../App.css";
import { CrossIcon } from "../Icons";

const ImageUploader = ({ size = "full", onChange, initialImage }) => {
    const [images, setImages] = useState([]);
    const [currentImage, setCurrentImage] = useState(initialImage);

    const handleChange = (imageList) => { 
        setImages(imageList);
        if (onChange) {
            onChange(imageList);
        }
        if (imageList.length > 0) {
            setCurrentImage(imageList[0]?.data_url || imageList);
        }
    };

    const handleRemoveImage = () => {
        setImages([]);
        setCurrentImage(null); // Clear the displayed image
        if (onChange) {
            onChange([]); // Notify parent of cleared selection
        }
    };

    const containerClass = size === "full" ? "w-full h-full" : "w-1/2 h-1/2";

    return (
        <div>
            <ImageUploading
                value={images}
                onChange={handleChange}
                maxNumber={1}
                dataURLKey="data_url"
            >
                {({ imageList, onImageUpload, dragProps }) => (
                    <div className={`upload__image-wrapper ${containerClass}`}>
                        {currentImage ? (
                          <>
                            <div
                            onClick={onImageUpload}
                            {...dragProps}
                            className="flex items-center cursor-pointer border-2 border-gray-300 p-4 rounded-lg mb-4"
                        >
                            <div className="text-black text-sm m-auto">
                                Click here to upload a banner or drag any image
                            </div>
                        </div>
                            <div className={`image-item border-2 border-gray-300 p-6 rounded-lg ${containerClass}`}>
                                <img
                                    src={currentImage}
                                    alt="Uploaded"
                                    className="uploaded-image"
                                />
                                <div
                                    onClick={handleRemoveImage}
                                    className="remove-icon"
                                >
                                    <CrossIcon />
                                </div>
                            </div>
                          </>
                        ) : (
                            <div
                                onClick={onImageUpload}
                                {...dragProps}
                                className="flex items-center cursor-pointer border-2 border-gray-300 p-4 rounded-lg"
                            >
                                <div className="text-black text-sm m-auto">
                                    Click here to upload a banner or drag any image
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ImageUploading>
        </div>
    );
};

export default ImageUploader;
