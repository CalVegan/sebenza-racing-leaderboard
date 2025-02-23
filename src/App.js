// Initializing the Sebenza Racing Leaderboard app with React and Firebase
// This includes a dual leaderboard system for Staff and Clients/Suppliers
// Using Clash Grotesk font and Sebenza branding colours

// React & Firebase Imports
import React, { Fragment, useEffect, useState } from 'react';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { db } from './firebase';
import { collection, query, onSnapshot, orderBy, addDoc } from 'firebase/firestore';
import './App.css';
import './fonts/clash-grotesk.css';

// Headless UI for Modal
import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/solid';

const Leaderboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    lapTime: '',
    date: '',
    category: 'staff' // Default to staff
  });
  const [staffTimes, setStaffTimes] = useState([]);
  const [clientTimes, setClientTimes] = useState([]);

  // Modal State and Handlers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeInput, setTimeInput] = useState({
    minutes: '',
    seconds: '',
    milliseconds: ''
  });

  // Toggle Modal
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  // Handle Time Input Changes
  const handleTimeChange = (field, value) => {
    setTimeInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle Form Submission
  const handleSubmit = async () => {
    if (!formData.name || !formData.company || !timeInput.minutes || !timeInput.seconds || !timeInput.milliseconds) {
      alert('All fields are required!');
      return;
    }
    const formattedLapTime = `${timeInput.minutes}:${timeInput.seconds}.${timeInput.milliseconds}`;
    try {
      const collectionRef = collection(db, formData.category === 'staff' ? 'staff' : 'clients');
      await addDoc(collectionRef, {
        name: formData.name,
        company: formData.company,
        lapTime: formattedLapTime,
        date: formData.date
      });
      alert('Lap time added successfully!');
      setFormData({ name: '', company: '', lapTime: '', date: '', category: 'staff' });
      setTimeInput({ minutes: '', seconds: '', milliseconds: '' });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('Failed to add lap time. Please try again.');
    }
  };

  useEffect(() => {
    const staffQuery = query(collection(db, 'staff'), orderBy('lapTime', 'asc'));
    const clientQuery = query(collection(db, 'clients'), orderBy('lapTime', 'asc'));

    const unsubscribeStaff = onSnapshot(staffQuery, (snapshot) => {
      setStaffTimes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeClients = onSnapshot(clientQuery, (snapshot) => {
      setClientTimes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeStaff();
      unsubscribeClients();
    };
  }, []);

  return (
    <div className='leaderboard-container bg-black text-yellow-500 min-h-screen p-8'>
      <h1 className='title text-4xl font-bold font-[ClashGrotesk-Bold] mb-8 text-center'>Sebenza Racing Leaderboard</h1>
      
      <div className='leaderboard-section'>
        <h2 className='section-title text-3xl font-[ClashGrotesk-Semibold] mb-4'>Staff Leaderboard</h2>
        {staffTimes.map((entry) => (
          <Card key={entry.id} className='leaderboard-card bg-yellow-500 text-black p-4 rounded-2xl shadow-lg mb-4 transition-transform transform hover:scale-105'>
            <CardContent>
              <h3>{entry.name} - {entry.company}</h3>
              <p>Time: {entry.lapTime}</p>
              <p>Date: {entry.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='leaderboard-section'>
        <h2 className='section-title text-3xl font-[ClashGrotesk-Semibold] mb-4'>Client & Supplier Leaderboard</h2>
        {clientTimes.map((entry) => (
          <Card key={entry.id} className='leaderboard-card bg-yellow-500 text-black p-4 rounded-2xl shadow-lg mb-4 transition-transform transform hover:scale-105'>
            <CardContent>
              <h3>{entry.name} - {entry.company}</h3>
              <p>Time: {entry.lapTime}</p>
              <p>Date: {entry.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button 
        className='bg-yellow-500 text-black p-2 rounded-full shadow-lg hover:bg-yellow-600 transition-transform transform hover:scale-110'
        onClick={toggleModal}
      >
        <PlusIcon className='h-6 w-6' />
      </Button>

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={toggleModal}>
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-black p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title className="text-lg font-medium leading-6 text-yellow-500 text-center">
                  Add Lap Time
                </Dialog.Title>
                <div className="mt-4 space-x-2 flex justify-center">
                  <input type="number" placeholder="Min" value={timeInput.minutes} onChange={(e) => handleTimeChange('minutes', e.target.value)} className="w-16 p-2 bg-gray-800 text-yellow-500 rounded-lg text-center" />
                  <input type="number" placeholder="Sec" value={timeInput.seconds} onChange={(e) => handleTimeChange('seconds', e.target.value)} className="w-16 p-2 bg-gray-800 text-yellow-500 rounded-lg text-center" />
                  <input type="number" placeholder="Ms" value={timeInput.milliseconds} onChange={(e) => handleTimeChange('milliseconds', e.target.value)} className="w-20 p-2 bg-gray-800 text-yellow-500 rounded-lg text-center" />
                </div>
                <Button className="bg-yellow-500 text-black px-4 py-2 rounded-xl hover:bg-yellow-600 mt-4" onClick={handleSubmit}>Submit</Button>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Leaderboard;
