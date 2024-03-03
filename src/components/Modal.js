import React, { useEffect, useRef, useState } from 'react';

const Modal = ({ showModal, setShowModal, children }) => {
  const modalRef = useRef();
  const [animationClass, setAnimationClass] = useState('animate-fade-in');

  useEffect(() => {
    if (showModal) {
      setAnimationClass('animate-fade-in');
    }
  }, [showModal]);

  const handleCloseModal = () => {
    setAnimationClass('animate-fade-out');
    setTimeout(() => setShowModal(false), 500); // Match the timeout with animation duration
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      handleCloseModal();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    showModal && (
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center ${animationClass}`}
        onClick={handleCloseModal}
      >
        <div
          ref={modalRef}
          className="bg-white p-5 rounded-lg shadow-lg w-96 relative"
          onClick={(e) => e.stopPropagation()}
        >
            
          {children}
          <button
          type='button'
            className="absolute top-0 right-0 m-2 text-lg font-semibold"
            onClick={handleCloseModal}
          >
            ✕
          </button>
        </div>
      </div>
    )
  );
};

export default Modal;
