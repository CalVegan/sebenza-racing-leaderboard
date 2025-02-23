// Initializing the Sebenza Racing Leaderboard app with React and Firebase
// This will include a dual leaderboard system for Staff and Clients/Suppliers
// Using Clash Grotesk font and SEbenza branding colours

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { db } from './firebase'; // Firebase setup for Firestore
import { collection, query, onSnapshot, orderBy, addDoc } from 'firebase/firestore';
import './App.css';
import './fonts/clash-grotesk.css'; // Custom styles for SEbenza branding

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

  const handleSubmit = async () => {
    if (!formData.name || !formData.company || !formData.lapTime || !formData.date) {
      alert('All fields are required!');
      return;
    }
    try {
      const collectionRef = collection(db, formData.category === 'staff' ? 'staff' : 'clients');
      await addDoc(collectionRef, {
        name: formData.name,
        company: formData.company,
        lapTime: formData.lapTime,
        date: formData.date
      });
      alert('Lap time added successfully!');
      setFormData({ name: '', company: '', lapTime: '', date: '', category: 'staff' });
      setShowForm(false);
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
      <h1 className='title text-4xl font-bold font-[ClashGrotesk-Bold] mb-8 text-center'>SEbenza Racing Leaderboard</h1>
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
      <Button className='add-time-button bg-pastel-pink text-black px-4 py-2 rounded-xl font-[ClashGrotesk-Medium] hover:bg-pastel-yellow transition-colors' onClick={() => setShowForm(!showForm)}>Add New Lap Time</Button>

      {showForm && (
        <div className='form-container bg-white p-4 rounded-xl shadow-lg mt-4'>
          <h3 className='text-2xl font-[ClashGrotesk-Semibold] mb-4'>Add New Lap Time</h3>
          <input type='text' placeholder='Name' value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className='input-field mb-2'/>
          <input type='text' placeholder='Company' value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className='input-field mb-2'/>
          <input type='text' placeholder='Lap Time (e.g., 01:23.456)' value={formData.lapTime} onChange={(e) => setFormData({ ...formData, lapTime: e.target.value })} className='input-field mb-2'/>
          <input type='date' value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className='input-field mb-2'/>
          <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className='input-field mb-2'>
            <option value='staff'>Staff</option>
            <option value='clients'>Client/Supplier</option>
          </select>
          <Button className='submit-button bg-black text-yellow-500 px-4 py-2 rounded-xl font-[ClashGrotesk-Medium] hover:bg-yellow-600 transition-colors mt-2' onClick={handleSubmit}>Submit</Button>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
