import React, { useState } from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
const UploadImage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [croppedImages, setCroppedImages] = useState([]);
    const [selectedCroppedImage, setSelectedCroppedImage] = useState(null);
    const [finalImage, setFinalImage] = useState(null);
    const [whiteArea, setWhiteArea] = useState(null);
    const [totalArea, setTotalArea] = useState(null);
    const [ratio, setRatio] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        resetState();
    };

    const resetState = () => {
        setCroppedImages([]);
        setSelectedCroppedImage(null);
        setFinalImage(null);
        setWhiteArea(null);
        setTotalArea(null);
        setRatio(null);
    };

    const handleUpload = () => {
        const formData = new FormData();
        formData.append('image', selectedFile);

        axios.post('http://127.0.0.1:5000/upload', formData)
            .then(response => {
                setCroppedImages(response.data.cropped_images);
                setSelectedCroppedImage(null);  
            })
            .catch(error => {
                console.error('There was an error uploading the image!', error);
            });
    };

    const handleSelectCroppedImage = (imagePath) => {
        setSelectedCroppedImage(imagePath);
    };

    const handleProcessImage = () => {
        axios.post('http://127.0.0.1:5000/process', { image_path: selectedCroppedImage })
            .then(response => {
                setFinalImage(response.data.final_image);
                setWhiteArea(response.data.white_area);
                setTotalArea(response.data.total_area);
                setRatio(response.data.ratio);
            })
            .catch(error => {
                console.error('There was an error processing the image!', error);
            });
    };

    const handleReset = () => {
        window.location.reload();
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-2">
            <div className="container mt-5">
                <Row className="justify-content-center">
                    <Col xs={12} md={8} lg={6}>
                        <h1 className="text-center" style={{marginBottom : "50px"}}>Upload Image</h1>
                        <Form.Group controlId="formFile" className="mb-3" >
                            <Form.Control type="file" onChange={handleFileChange} />
                        </Form.Group>
                        <div className="text-center"  style={{marginTop : "30px"}}>
                            <Button variant="outline-success" onClick={handleUpload}>Upload</Button>
                            <Button variant="outline-danger" onClick={handleReset} className="ml-2" style={{marginLeft : "20px"}} >Reset</Button>
                        </div>
                        { !finalImage && (
                        <div className="d-flex justify-content-center mt-4">
                            {croppedImages.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Cropped ${index}`}
                                    onClick={() => handleSelectCroppedImage(image)}
                                    style={{ cursor: 'pointer', border: selectedCroppedImage === image ? '2px solid blue' : 'none', margin: '0 10px' }}
                                />
                            ))}
                        </div>
                        
                                )}
                                 { !finalImage && (
                                 <div className="text-center mt-4">
                         <button onClick={handleProcessImage} disabled={!selectedCroppedImage} className="btn btn-primary">Process Selected Image</button>
                     </div>
                       )}
                        {finalImage && (
                            <div className="text-center mt-4">
                                <h2>Processed Image</h2>
                                <img src={finalImage} alt="Final" />
                                <p>White area pixel count: {whiteArea}</p>
                                <p>Total area: {totalArea}</p>
                                <p>Ratio: {ratio}</p>
                            </div>
                        )}
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default UploadImage;
