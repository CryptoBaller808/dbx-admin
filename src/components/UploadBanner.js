import React, { useState } from 'react';
import "../App.css"; // Assuming you have necessary styles in this file 
import { CrossIcon } from '../Icons';

const UploadBanner = ({ onChange, initialFile, index, size = "full" }) => {
    const [uploadedFile, setUploadedFile] = useState(initialFile);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const isValidFileType = file.type.startsWith("image/") || file.type.startsWith("video/");
            if (isValidFileType) {
                setUploadedFile(file);
                onChange?.(file);
            } else {
                alert("Please select a valid image or video file.");
            }
        }
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        onChange?.(null);
    };

    const containerClass = size === "full" ? "w-full h-full" : "w-1/2 h-1/2";

    // Determine the preview content
    const renderPreview = () => {
        if (typeof uploadedFile === "string") {
            // Handle remote files
            if (/\.(png|jpg|jpeg|jfif)$/i.test(uploadedFile)) {
                return <img src={uploadedFile} alt="Preview" className="uploaded-preview uploaded-image" />;
            }
            if (/\.mp4$/i.test(uploadedFile)) {
                return <video src={uploadedFile} autoPlay className="uploaded-preview" />;
            }
        } else if (uploadedFile) {
            // Handle local files
            if (uploadedFile.type.startsWith("image/")) {
                return <img src={URL.createObjectURL(uploadedFile)} alt="Preview" className="uploaded-preview uploaded-image" />;
            }
            if (uploadedFile.type.startsWith("video/")) {
                return <video src={URL.createObjectURL(uploadedFile)} autoPlay className="uploaded-preview" />;
            }
        }
        return null;
    };

    const inputId = `fileInput-${index || Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`upload-banner ${containerClass}`}>
            {!uploadedFile ? (
                <div
                    className="flex items-center cursor-pointer border-2 border-gray-300 p-4 rounded-lg"
                    onClick={() => document.getElementById(inputId)?.click()}
                >
                    <div className="text-black text-sm m-auto">
                        Click here to upload a banner or drag any image/video
                    </div>
                </div>
            ) : (
                <>
                    <div
                        className="flex items-center cursor-pointer border-2 border-gray-300 p-4 rounded-lg mb-2"
                        onClick={() => document.getElementById(inputId)?.click()}
                    >
                        <div className="text-black text-sm m-auto">
                            Click here to upload a banner or drag any image/video
                        </div>
                    </div>
                    <div className="uploaded-file-container relative border-2 border-gray-300 p-6 rounded-lg">
                        {renderPreview()}
                        <div
                            className="remove-icon absolute top-2 right-2 cursor-pointer z-10"
                            onClick={handleRemoveFile}
                        >
                            <CrossIcon />
                        </div>
                    </div>
                </>
            )}
            <input
                id={inputId}
                type="file"
                accept="image/*,video/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
            />
        </div>
    );
};

export default UploadBanner;
