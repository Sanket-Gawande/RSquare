import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setMyImages, setUser } from '../../redux/user.slice';
import ImageCard from '../ImageCard';

const home = () => {
  const user = useSelector(state => state.user);
  const [selectedImages, setSelected] = useState([])
  const [warning, setWarning] = useState(null)
  const [success, setSuccess] = useState("done !")
  const dispatch = useDispatch()
  const uploadButtonRef = useRef()
  const confirmDeleteRef = useRef()
  const [images, setImages] = useState([]);
  const [uploadModal, setUploadModal] = useState(false);
  const navigate = useNavigate()
  const resetUser = () => {
    localStorage.removeItem("user");
    dispatch(setUser({}));
    navigate("/")
  }
  const formatSize = (size) => {
    return size > 10 ** 6 ? Math.round(size / (10000)) / 100 + "Mb" : Math.round(size / (100)) / 10 + "Kb"
  }
  const showSelectedImages = e => {
    const inputImages = Array.from(e.target.files);
    const imagesData = inputImages.map(image => {
      return { name: image.name, file: URL.createObjectURL(image), size: image.size, bin: image }
    }
    );
    setImages([...images, ...imagesData])
  }
  const handleImageUpload = async () => {
    uploadButtonRef.current.innerHTML = "Please wait..."
    uploadButtonRef.current.disabled = true
    const formdata = new FormData();
    for (let image of images) {
      formdata.append("images", image.bin)
    }
    // formdata.append("images", images[1].bin)
    const req = await fetch(`${import.meta.env.VITE_SERVER}/images/add`, {
      method: "post",
      body: formdata,
      credentials: "include",
      headers: {
        'Accept': "*"
      }
    });
    const res = await req.json();
    if (res.token === "not-provided") {
      resetUser()
    }
    // console.log([...res?.imagesData])
    dispatch(setMyImages(user?.files?.concat(res?.imagesData)));
    localStorage.setItem("user", JSON.stringify({ ...user, files: user?.files?.concat(res?.imagesData) }))
    uploadButtonRef.current.innerHTML = "Upload"
    uploadButtonRef.current.disabled = false
    setImages([])
    setUploadModal(false)
  }
  // basic logout 
  // removes user from localStorage
  function logOut() {
    localStorage.removeItem("user");
    resetUser()
  }
  // handles delete iamges
  const handleDeleteImages = async () => {
    confirmDeleteRef.current.innerHTML = "Deleting..."
    confirmDeleteRef.current.disabled = true
    const req = await fetch(`${import.meta.env.VITE_SERVER}/images/delete`, {
      method: "post",
      body: JSON.stringify({ ids: selectedImages, paths: user.files?.filter(item => { if (selectedImages.includes(item?.id)) { return item?.path } }) }),
      credentials: "include",
      headers: {
        "content-type": "application/json",
      }
    })
    const res = await req.json();
    if (res.token === "not-provided") {
      resetUser()
    }
    if (!res?.error) {
      const images = user?.files?.filter(obj => !selectedImages.includes(obj?.id))
      dispatch(setMyImages(images))
      setSelected([]);
      localStorage.setItem("user", JSON.stringify({ ...user, files: images }))
      confirmDeleteRef.current.innerHTML = "Done."
      confirmDeleteRef.current.disabled = false
    }
    confirmDeleteRef.current.innerHTML = "delete"
    setWarning(null)

  }
  const refreshData = async () => {
    const req = await fetch(`${import.meta.env.VITE_SERVER}/getuser`, {
      method: "post",
      credentials: "include"
    })
    const res = await req.json()
    console.log(res, "refresh user--> home.jsx")
    if (res.token === "not-provided") {
      resetUser()

    }
    dispatch(setUser({ ...res?.user, name: `${res.user?.fname} ${res?.user?.lname}` }))
  }
  useEffect(() => { refreshData() }, [])
  return (
    <section className='h-full bg-white w-full transition-all duration-300'>
      {/* logout button */}
      <button title='log out' className='fixed bottom-12 right-0 rounded-l-full text-md bg-primary p-2 pl-3 pr-4 shadow-sm text-white' onClick={logOut}> <i className="fa-solid fa-power-off"></i> </button>
      {/* for showing alert or warning */}
      {
        warning &&
        <section className='inset-0 z-10 fixed bg-slate-800/70 grid place-items-center'>
          <div className='bg-white rounded-md p-6  w-[90%] max-w-[400px]'>
            <h4 className='text-lg font-semibold text-primary'>{warning}</h4>
            <div className='flex mt-8 space-x-3 items-end justify-end text-sm font-semibold'>
              <button className='py-1 px-4 border rounded-md text-primary border-current' onClick={() => setWarning(null)}>cancel</button>
              <button className='py-1 px-4 bg-primary rounded-md text-white border ' onClick={handleDeleteImages} ref={confirmDeleteRef}>
                Delete
                <i className="fa text-sm ml-2 fa-trash"></i>
              </button>
            </div>
          </div>
        </section>
      }
      {
        uploadModal ?
          // upload images modal

          <section className='fixed z-40 inset-0 grid w-full bg-slate-900/50 place-content-center'>
            <div className=' md:w-[600px] w-[90%] min-w-[350px]  pt-4  rounded-md mx-auto bg-white'>
              <div className='w-full flex items-center px-4 pb-3 justify-between border-b'>
                <h4>Upload images</h4>
                <i className="fa fa-times cursor-pointer" onClick={() => setUploadModal(false)}></i>
              </div>
              <input onChange={showSelectedImages} type="file" typeof='image' multiple id='files' className='hidden' accept='image/*' />
              <div className='w-full text-sm text-center p-5 py-6'>
                {
                  images.length === 0 ?

                    <div className='flex items-center  justify-center flex-col h-[256px] border-2 border-dashed bg-gray-50 rounded-sm'>
                      <p className='my-2'>Select images to upload</p>

                      <input onChange={showSelectedImages} type="file" accept='.jpeg , png ,.gif , .webp ' multiple id='files' className='hidden' />
                      <label htmlFor="files" className='text-primary cursor-pointer border border-current px-4 py-1 rounded-md w-max block mx-auto'>Browse</label>
                    </div>
                    :
                    <div className='py-4 px-4 flex flex-wrap h-[256px] justify-center md:justify-start overflow-auto bg-primary/10 rounded-sm'>
                      {
                        images.reverse().map(image =>
                          <div key={image.name} className="w-24 relative h-24 rounded-sm bg-white/50 m-1">
                            <button onClick={() => {
                              setImages(images.filter(img => img.name !== image.name))
                            }} className='absolute  top-1 right-1  h-4 w-4 shadow-xs grid place-items-center  bg-slate-30 text-slate-500 text-sm border-current rounded-full border'>

                              <i className="fa fa-times text-[10px] "></i>
                            </button>
                            <img src={image.file} className="w-full h-full object-contain" alt={image.name} />
                            <div className='flex justify-between items-center absolute bottom-0 w-full bg-slate-500/80 px-2  text-white text-[10px]'>
                              <p className=' '>{image.name?.substring(0, 5)}...</p>
                              <p>{formatSize(image.size)}</p>
                            </div>
                          </div>
                        )
                      }

                    </div>
                }
              </div>
              {
                images?.length > 0 ?
                  <section className='border-t py-3 px-4 flex justify-end'>
                    <label htmlFor="files" className='text-primary border-current border py-1  px-4 rounded-md mx-2  '>Add more</label>
                    <button className='bg-primary text-white py-1  px-4 rounded-md' ref={uploadButtonRef} onClick={handleImageUpload}>Upload</button>
                  </section> : null
              }
            </div>
          </section>
          : null
      }
      <header className='w-[90%] mx-auto transition-all duration-300 py-6 md:px-6 flex justify-between flex-wrap items-center'>
        <div>
          <h2 className='font-bold text-2xl md:text-3xl'>Media library</h2>
          <p className='text-slate-500 font-medium'>{user?.files?.length || 0} images</p>

        </div>
        <div className='flex items-center justify-between md:mx-0 mt-4' >
          <button onClick={() => setUploadModal(!uploadModal)} htmlFor='files' className='py-3 px-3 md:px-5 bg-primary cursor-pointer text-white font-semibold h-max  rounded-md'>
            <i className="fa-solid fa-circle-plus mr-2"></i>
            Upload images</button>
          {
            selectedImages.length > 0 &&
            <button onClick={() => setWarning("Are you sure to delete the selected images?")} htmlFor='files' className='py-3 mx-2 px-3 md:px-5 text-primary cursor-pointer duration-300 transition-all  font-semibold h-max  border border-current rounded-md'>
              <i className="fa-solid fa-trash mr-2"></i>
              Delete selected</button>
          }
        </div>

      </header>
      {/* gallery section */}
      <section className='w-full'>
        {
          user?.files?.length ?
            // gallery ui
            <section className='w-[90%] transition-all duration-500 mx-auto py-6 mt-4 md:mt-4 md:px-6 flex flex-wrap md:justify-start justify-center '>
              {

                user?.files?.map(image =>
                  <ImageCard key={image?.id} image={image} selectedImages={selectedImages
                  } setSelected={setSelected} />
                ).reverse()
              }
            </section>
            :
            // fallback ui
            <section className='w-full max-w-[800px] mx-auto mt-4'>
              <img src="/no-images.jpeg" alt="no images" />
              <p className='text-center text-slate-600 font-medium py-4'>Click on 'upload' to start uploading images</p>
            </section>
        }
      </section>
    </section>
  )
}

export default home