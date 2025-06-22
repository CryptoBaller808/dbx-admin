import React, { useState } from 'react';

const UploadButton = ({ onChange, text }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
            setSelectedFile(file);
            if (onChange) {
                onChange(file)
            }
            // You can handle the upload logic here, for example:
            // handleUpload(file);
        } else {
            alert('Please select a valid image file (PNG/JPEG)');
        }
    };

    return (
        <div className="upload-button-container w-full">
            <button className="button  w-full" onClick={() => document.getElementById('fileInput').click()}>
                {text || "Upload"}
            </button>

            <input
                id="fileInput"
                type="file"
                accept="image/png, image/jpeg"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {selectedFile && (
                <div className='mt-3'>
                    {/* <p>Selected file: {selectedFile.name}</p> */}
                    {/* Optionally show the image preview */}
                    <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                </div>
            )}
        </div>
    );
};

export default UploadButton;
