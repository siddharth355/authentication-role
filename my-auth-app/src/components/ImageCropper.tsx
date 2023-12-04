import React, { useState, useRef, useCallback, useEffect} from 'react';
import Cropper, { Area } from 'react-easy-crop';
import axios from 'axios';

const ImageCropper: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [username, setUsername] = useState<string>(''); // Assuming 'username' is a string
  const [userProfile, setUserProfile] = useState<any>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);


  const token = localStorage.getItem("token");
  console.log(token,"tokennnnnnnnnnnnnnnnnnnnnnnnnnnn")

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setModalIsOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => setCroppedArea(croppedAreaPixels),
    []
  );

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      // Call the user profile API
      const response = await axios.get('http://localhost:5000/api/userProfile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update the state with user profile data
      setUserProfile(response.data.data);

      // If the user has an uploaded image, set the image URL
      if (response.data.data.images && response.data.data.images.length > 0) {
        setUploadedImageUrl(response.data.data.images[0]);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };
  
  useEffect(()=>{
    fetchUserProfile();
  },[])

   const handleCrop = () => {
    if (image && croppedArea) {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const imageElement = new Image();
      
      // Set the image source
      imageElement.src = image!;
      
      // Wait for the image to load
      imageElement.onload = () => {
        // Set the canvas dimensions based on the cropped area
        canvas.width = croppedArea.width!;
        canvas.height = croppedArea.height!;
        
        // Draw the cropped portion of the image onto the canvas
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(
          imageElement,
          croppedArea.x,
          croppedArea.y,
          croppedArea.width!,
          croppedArea.height!,
          0,
          0,
          croppedArea.width!,
          croppedArea.height!
        );
  
        // Get the binary data URL from the canvas
        const croppedImageDataUrl = canvas.toDataURL('image/png');
        console.log('Cropped Image Data URL:', croppedImageDataUrl);
        
        // Now, you can set this binary data URL to your state or use it as needed
      };
      
      setModalIsOpen(false);
    }
  };
  
  const handleSave = () => {
    if (image && croppedArea) {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const imageElement = new Image();
      
      // Set the image source
      imageElement.src = image!;
      
      // Wait for the image to load
      imageElement.onload = () => {
        // Set the canvas dimensions based on the cropped area
        canvas.width = croppedArea.width!;
        canvas.height = croppedArea.height!;
        
        // Draw the cropped portion of the image onto the canvas
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(
          imageElement,
          croppedArea.x,
          croppedArea.y,
          croppedArea.width!,
          croppedArea.height!,
          0,
          0,
          croppedArea.width!,
          croppedArea.height!
        );
  
        // Get the binary data URL from the canvas
        const croppedImageDataUrl = canvas.toDataURL('image/png');
  
        // Send the cropped image data to the server
        axios.post('http://localhost:5000/api/upload-image', {
        image: croppedImageDataUrl,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          // other headers if needed
        },
      })
        .then((response) => {
          console.log('Image saved successfully:', response.data.message);
        })
        .catch((error) => {
          console.error('Error saving image:', error);
        });
        
        // Now, you can set this binary data URL to your state or use it as needed
      };
    }
  };
  

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={inputRef}
        style={{ display: 'none' }}
      />
      <button onClick={() => inputRef.current?.click()}>Select Image</button>
      {modalIsOpen && (
        <div id="modal" style={modalStyles}>
          <Cropper
            image={image!}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
            <div style={modalButtonStyles}>
              <button onClick={handleCrop} >Crop</button>
              <button onClick={handleSave}>Save</button>
            </div>
        </div>
      )}
      <div>
      {uploadedImageUrl && (
        <div>
          <h2>User Profile</h2>
          <div>
            <p>Username: {userProfile?.username}</p>
            <p>Email: {userProfile?.email}</p>
          </div>
          <img src={uploadedImageUrl} alt="Uploaded" style={{ maxWidth: '100%' }} />
        </div>
      )}
      </div>
    </div>
  );
};

const modalStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'fixed',
  top: '0',
  left: '0',
  width: '60%',
  height: '60%',
  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
  padding: '20px',
  zIndex: 1000,  
  overflow: 'auto', 
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
};
const modalButtonStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'fixed',
  top: '70%',
  left: '3  0%',
  // width: '60%',
  // height: '60%',
  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
  padding: '20px',
  zIndex: 1000,  
  overflow: 'auto', 
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
};


export default ImageCropper;
