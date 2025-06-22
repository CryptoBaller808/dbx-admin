import React, { useEffect, useState } from 'react';
import ImageUploader from '../components/ImageUplodaer';
import { uploadFile } from '../api/executers/uploadFile';
import { getBanner, uploadBanner } from '../api/executers/settings';
import { toast, ToastContainer } from 'react-toastify';
import UploadBanner from '../components/UploadBanner';
import Spinner from '../components/Spinner/Spinner';

const Settings = () => {
  const [banners, setBanners] = useState([]);
  const [updatedBanners, setUpdatedBanners] = useState({});
  const [isDiabled, setIsDisabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)


  const getBanners = async () => {
    setIsLoading(true)
    try {
      const resp = await getBanner();
      if (resp.success) {
        setBanners(resp.data);
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false)
  };

  useEffect(() => {
    getBanners();
  }, []);

  const handleImageUpload = async (imageList, type) => {
    try {
      const file = imageList[0]?.file || imageList;
      if (!file) return;

      setUpdatedBanners((prev) => ({
        ...prev,
        [type]: file,
      }));
      if (file) {
        setIsDisabled(false)
      }

      // const formData = new FormData();
      // formData.append('file', file);

      // const response = await uploadFile(formData);
      // if (response.success) {
      //   setUpdatedBanners((prev) => ({
      //     ...prev,
      //     [type]: response.data,
      //   })); 
      // }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  //   const handleUpdate = async () => {
  //     const bannersPayload = banners
  //       .filter((banner) => updatedBanners[banner.type] || banner.url)  // Include only banners with a URL
  //       .map((banner) => ({
  //         type: banner.type,
  //         url: updatedBanners[banner.type] || banner.url,
  //       }));

  // console.log(bannersPayload);
  //     // try {
  //     //   const response = await uploadBanner({ banners: bannersPayload });
  //     //   if (response.success) {
  //     //     toast.success(response.message);
  //     //     setUpdatedBanners({});
  //     //     getBanners(); // Refresh the banners
  //     //   }
  //     // } catch (error) {
  //     //   console.error('Error updating banners:', error);
  //     // }
  //   };



  const handleUpdate = async () => {
    setIsLoading(true)
    try {
      const bannersPayload = [];
      const uploadPromises = [];
      // Process each updated banner 
      for (const [type, file] of Object.entries(updatedBanners)) {
        if (file instanceof File) {
          // Prepare FormData for upload
          const formData = new FormData();
          formData.append("file", file);

          // Upload file and store the result
          const uploadPromise = uploadFile(formData).then((response) => {
            if (response.success && response.data) {
              bannersPayload.push({ type, url: response.data });
            } else {
              console.error(`Failed to upload file for type ${type}:`, response.message);
            }
          });

          uploadPromises.push(uploadPromise);
        }
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
      // Send the payload to your backend
      const response = await uploadBanner({ banners: bannersPayload });
      if (response.success) {
        toast.success(response.message);
        setUpdatedBanners({});
        getBanners(); // Refresh banners
      }
    } catch (error) {
      console.error("Error updating banners:", error);
    }
    setIsLoading(false)

  }; 

  return (
    <>
      <ToastContainer position="top-right" autoClose={1500} />
      {isLoading && <Spinner />}
      <div className="blockchain-page flex flex-col">
        <div className="wrapWidth wrap flex flex-col">
          <div className="pg-hder flex aic">
            <div className="page-tag">Platform Settings</div>
          </div>
          
          {/* Banner Management Section */}
          <div className="table-blk flex flex-col p-7 gap-4 mb-6">
            <h3 className="text-xl font-semibold mb-4">Banner Management</h3>
            {banners?.map((banner, index) => {
              return (
                <div key={banner.id} className="crypto-tbl flex flex-col w-full">
                  <div className="row-item flex flex-col w-full h-full">
                    <div className="font-bold capitalize">{banner.type} Page</div>
                    <div className="mb-2">
                      <UploadBanner size="full"
                        onChange={(imageList) => {
                          handleImageUpload(imageList, banner?.type);
                        }}
                        index={banner.id}
                        initialFile={updatedBanners[banner.type] || banner.url}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            <div className="flex justify-end">
              <button disabled={isDiabled} onClick={handleUpdate} className={`btn-new button flex aic ${isDiabled && "cursor-not-allowed"}`}>
                Update Banners
              </button>
            </div>
          </div>

          {/* MFA Global Settings Section */}
          <div className="table-blk flex flex-col p-7 gap-4">
            <h3 className="text-xl font-semibold mb-4">Multi-Factor Authentication Settings</h3>
            <div className="mfa-settings-grid grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="setting-item">
                <label className="font-semibold text-gray-700">MFA Enforcement Policy</label>
                <select className="w-full p-2 border rounded mt-2">
                  <option value="optional">Optional for all users</option>
                  <option value="required_high_value">Required for high-value transactions</option>
                  <option value="required_all">Required for all users</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Controls when users are required to enable MFA
                </p>
              </div>
              
              <div className="setting-item">
                <label className="font-semibold text-gray-700">High-Value Transaction Threshold</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded mt-2" 
                  placeholder="1000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  USD amount that triggers MFA requirement
                </p>
              </div>
              
              <div className="setting-item">
                <label className="font-semibold text-gray-700">MFA Session Duration</label>
                <select className="w-full p-2 border rounded mt-2">
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="240">4 hours</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  How long MFA verification remains valid
                </p>
              </div>
              
              <div className="setting-item">
                <label className="font-semibold text-gray-700">Backup Codes Count</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded mt-2" 
                  value="10"
                  min="5"
                  max="20"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Number of backup recovery codes to generate
                </p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button className="btn-new button flex aic">
                Save MFA Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
