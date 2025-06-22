import React, { useState } from 'react'
import Spinner from '../components/Spinner/Spinner'
import axios from 'axios';
import { useAuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import { API_URL } from '../config';

const ChangePassword = () => {

    const [isLoading, setIsLoading] = useState(false);
    const { currentUser, verifyJwt } = useAuthContext();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState("");

    // headers for axios 
    let headers = {
        Authorization: `Bearer ${currentUser}`
    }



    // handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        let item = {
            oldPassword: currentPassword,
            newPassword: newPassword
        }

        try {
            const res = await axios.put(`${API_URL}/admindashboard/user/change_password`, { ...item }, { headers: headers });
            setIsLoading(false);
            let checkExpiry = verifyJwt(res?.data);
            if(checkExpiry){
                toast.success(res?.data?.message, {
                    position: "top-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
                setCurrentPassword('')
                setNewPassword('')
            }

        } catch (e) {
            console.log(e);
            setIsLoading(false);
            toast.error('Something Went Wrong', {
                position: "top-right",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            setCurrentPassword('')
            setNewPassword('')
        }
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={1500}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            {isLoading && <Spinner />}
            <div className='login-container'>
                <div className="flex items-center mt-8 w-full">
                    <div className="w-full bg-white rounded shadow-lg p-8 m-4 md:max-w-sm md:mx-auto">
                        <span className="block w-full text-xl uppercase font-bold mb-4">Change Password</span>
                        <form className="mb-4" onSubmit={handleSubmit}>
                            <div className="mb-4 md:w-full">
                                <input className="w-full border rounded p-2 outline-none focus:shadow-outline" type="password" name="currentPassword" id="currentPassword" placeholder="Current Password" value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)} required />
                            </div>
                            <div className="mb-6 md:w-full">
                                <input className="w-full border rounded p-2 outline-none focus:shadow-outline" type="password" name="newPassword" id="newPassword" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                            </div>
                            <button type='submit' className="bg-green-500 hover:bg-green-700 text-white uppercase text-sm w-full font-semibold px-4 py-2 rounded">
                                {isLoading ? "Loading..." : "Submit"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChangePassword