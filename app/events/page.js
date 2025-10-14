'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Users, Trophy, User, Clock, MapPin } from 'lucide-react';
import useStore from '@/store/useStore';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firebase';
import PageHeader from '@/components/PageHeader';

export default function Events() {
  const { 
    events, 
    participants, 
    prizes, 
    members, 
    setEvents, 
    setParticipants, 
    setPrizes, 
    setMembers,
    getEventsWithDetails 
  } = useStore();
  
  const [activeTab, setActiveTab] = useState('events');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [editingPrize, setEditingPrize] = useState(null);

  // Event form data
  const [eventFormData, setEventFormData] = useState({
    name: '',
    date: '',
    time: '',
    category: '',
    description: '',
    responsibleMemberId: '',
    location: ''
  });

  // Participant form data
  const [participantFormData, setParticipantFormData] = useState({
    name: '',
    role: 'solo',
    eventId: '',
    contact: '',
    notes: ''
  });

  // Prize form data
  const [prizeFormData, setPrizeFormData] = useState({
    position: '',
    type: 'cash',
    amount: '',
    description: '',
    eventId: '',
    winnerId: '',
    sponsorId: ''
  });

  useEffect(() => {
    const unsubscribeEvents = subscribeToCollection(COLLECTIONS.EVENTS, setEvents);
    const unsubscribeParticipants = subscribeToCollection(COLLECTIONS.PARTICIPANTS, setParticipants);
    const unsubscribePrizes = subscribeToCollection(COLLECTIONS.PRIZES, setPrizes);
    const unsubscribeMembers = subscribeToCollection(COLLECTIONS.MEMBERS, setMembers);

    return () => {
      unsubscribeEvents();
      unsubscribeParticipants();
      unsubscribePrizes();
      unsubscribeMembers();
    };
  }, [setEvents, setParticipants, setPrizes, setMembers]);

  // Event handlers
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        ...eventFormData,
        date: new Date(eventFormData.date).toISOString()
      };
      
      if (editingEvent) {
        await updateDocument(COLLECTIONS.EVENTS, editingEvent.id, eventData);
      } else {
        await addDocument(COLLECTIONS.EVENTS, eventData);
      }
      resetEventForm();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleParticipantSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingParticipant) {
        await updateDocument(COLLECTIONS.PARTICIPANTS, editingParticipant.id, participantFormData);
      } else {
        await addDocument(COLLECTIONS.PARTICIPANTS, participantFormData);
      }
      resetParticipantForm();
    } catch (error) {
      console.error('Error saving participant:', error);
    }
  };

  const handlePrizeSubmit = async (e) => {
    e.preventDefault();
    try {
      const prizeData = {
        ...prizeFormData,
        amount: parseFloat(prizeFormData.amount) || 0
      };
      
      if (editingPrize) {
        await updateDocument(COLLECTIONS.PRIZES, editingPrize.id, prizeData);
      } else {
        await addDocument(COLLECTIONS.PRIZES, prizeData);
      }
      resetPrizeForm();
    } catch (error) {
      console.error('Error saving prize:', error);
    }
  };

  const handleEventEdit = (event) => {
    setEditingEvent(event);
    setEventFormData({
      name: event.name || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      time: event.time || '',
      category: event.category || '',
      description: event.description || '',
      responsibleMemberId: event.responsibleMemberId || '',
      location: event.location || ''
    });
    setIsEventModalOpen(true);
  };

  const handleParticipantEdit = (participant) => {
    setEditingParticipant(participant);
    setParticipantFormData({
      name: participant.name || '',
      role: participant.role || 'solo',
      eventId: participant.eventId || '',
      contact: participant.contact || '',
      notes: participant.notes || ''
    });
    setIsParticipantModalOpen(true);
  };

  const handlePrizeEdit = (prize) => {
    setEditingPrize(prize);
    setPrizeFormData({
      position: prize.position || '',
      type: prize.type || 'cash',
      amount: prize.amount?.toString() || '',
      description: prize.description || '',
      eventId: prize.eventId || '',
      winnerId: prize.winnerId || '',
      sponsorId: prize.sponsorId || ''
    });
    setIsPrizeModalOpen(true);
  };

  const handleEventDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDocument(COLLECTIONS.EVENTS, id);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleParticipantDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this participant?')) {
      try {
        await deleteDocument(COLLECTIONS.PARTICIPANTS, id);
      } catch (error) {
        console.error('Error deleting participant:', error);
      }
    }
  };

  const handlePrizeDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this prize?')) {
      try {
        await deleteDocument(COLLECTIONS.PRIZES, id);
      } catch (error) {
        console.error('Error deleting prize:', error);
      }
    }
  };

  // Reset forms
  const resetEventForm = () => {
    setEventFormData({
      name: '',
      date: '',
      time: '',
      category: '',
      description: '',
      responsibleMemberId: '',
      location: ''
    });
    setEditingEvent(null);
    setIsEventModalOpen(false);
  };

  const resetParticipantForm = () => {
    setParticipantFormData({
      name: '',
      role: 'solo',
      eventId: selectedEvent?.id || '',
      contact: '',
      notes: ''
    });
    setEditingParticipant(null);
    setIsParticipantModalOpen(false);
  };

  const resetPrizeForm = () => {
    setPrizeFormData({
      position: '',
      type: 'cash',
      amount: '',
      description: '',
      eventId: selectedEvent?.id || '',
      winnerId: '',
      sponsorId: ''
    });
    setEditingPrize(null);
    setIsPrizeModalOpen(false);
  };

  const eventsWithDetails = getEventsWithDetails();
  const totalEvents = events.length;
  const totalParticipants = participants.length;
  const totalPrizes = prizes.length;

  const categories = [
    'Dance',
    'Music',
    'Drama',
    'Poetry',
    'Art & Craft',
    'Quiz',
    'Debate',
    'Sports',
    'Cultural Show',
    'Other'
  ];

  const prizeTypes = ['cash', 'trophy', 'certificate', 'medal', 'gift'];

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Cultural Events"
        description="Manage cultural events, participants, and prizes"
        buttonText="Add Event"
        onButtonClick={() => setIsEventModalOpen(true)}
        buttonIcon={Plus}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 sm:p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Events</p>
              <p className="text-lg sm:text-xl xl:text-2xl font-semibold text-gray-900">{totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 sm:p-3 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Participants</p>
              <p className="text-lg sm:text-xl xl:text-2xl font-semibold text-gray-900">{totalParticipants}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 sm:p-3 bg-yellow-100 rounded-lg">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Prizes</p>
              <p className="text-lg sm:text-xl xl:text-2xl font-semibold text-gray-900">{totalPrizes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'events', name: 'Events', icon: Calendar },
            { id: 'participants', name: 'Participants', icon: Users },
            { id: 'prizes', name: 'Prizes', icon: Trophy }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Events</h3>
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {eventsWithDetails.map((event) => (
              <div key={event.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base sm:text-lg font-medium text-gray-900 truncate">{event.name}</h4>
                    <p className="text-sm text-gray-500 truncate">{event.category}</p>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => handleEventEdit(event)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEventDelete(event.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  {event.time && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{event.time}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                  {event.responsibleMember && (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{event.responsibleMember.name}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{event.participants?.length || 0} participants</span>
                    <span>{event.prizes?.length || 0} prizes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {events.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first event.</p>
            </div>
          )}
        </div>
      )}

      {/* Participants Tab */}
      {activeTab === 'participants' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Participants</h3>
            <button
              onClick={() => setIsParticipantModalOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Participant</span>
            </button>
          </div>

          <div className="space-y-4">
            {participants.map((participant) => {
              const event = events.find(e => e.id === participant.eventId);
              return (
                <div key={participant.id} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{participant.name}</h4>
                        <p className="text-sm text-gray-500 truncate">{event?.name || 'Unknown Event'}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {participant.role}
                          </span>
                          {participant.contact && (
                            <span className="text-xs text-gray-500">{participant.contact}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleParticipantEdit(participant)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleParticipantDelete(participant.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {participants.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No participants</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first participant.</p>
            </div>
          )}
        </div>
      )}

      {/* Prizes Tab */}
      {activeTab === 'prizes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Prizes</h3>
            <button
              onClick={() => setIsPrizeModalOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Prize</span>
            </button>
          </div>

          <div className="space-y-4">
            {prizes.map((prize) => {
              const event = events.find(e => e.id === prize.eventId);
              const winner = participants.find(p => p.id === prize.winnerId);
              const sponsor = members.find(m => m.id === prize.sponsorId);
              
              return (
                <div key={prize.id} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 p-2 bg-yellow-100 rounded-lg">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {prize.position} Prize - {event?.name || 'Unknown Event'}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">{prize.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                            {prize.type}
                          </span>
                          {prize.amount > 0 && (
                            <span className="text-xs text-green-600">₹{prize.amount.toLocaleString()}</span>
                          )}
                          {winner && (
                            <span className="text-xs text-blue-600">Winner: {winner.name}</span>
                          )}
                          {sponsor && (
                            <span className="text-xs text-purple-600">Sponsor: {sponsor.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePrizeEdit(prize)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePrizeDelete(prize.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {prizes.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No prizes</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first prize.</p>
            </div>
          )}
        </div>
      )}

      {/* Event Modal */}
      {isEventModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="mt-3">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>
              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventFormData.name}
                    onChange={(e) => setEventFormData({ ...eventFormData, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter event name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={eventFormData.date}
                      onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={eventFormData.time}
                      onChange={(e) => setEventFormData({ ...eventFormData, time: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={eventFormData.category}
                    onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={eventFormData.location}
                    onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
                    className="input-field"
                    placeholder="Enter event location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsible Member
                  </label>
                  <select
                    value={eventFormData.responsibleMemberId}
                    onChange={(e) => setEventFormData({ ...eventFormData, responsibleMemberId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select member</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={eventFormData.description}
                    onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Enter event description"
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingEvent ? 'Update' : 'Add'} Event
                  </button>
                  <button
                    type="button"
                    onClick={resetEventForm}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Participant Modal */}
      {isParticipantModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="mt-3">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                {editingParticipant ? 'Edit Participant' : 'Add New Participant'}
              </h3>
              <form onSubmit={handleParticipantSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Participant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={participantFormData.name}
                    onChange={(e) => setParticipantFormData({ ...participantFormData, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter participant name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event *
                  </label>
                  <select
                    required
                    value={participantFormData.eventId}
                    onChange={(e) => setParticipantFormData({ ...participantFormData, eventId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select event</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    required
                    value={participantFormData.role}
                    onChange={(e) => setParticipantFormData({ ...participantFormData, role: e.target.value })}
                    className="input-field"
                  >
                    <option value="solo">Solo</option>
                    <option value="group">Group</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact
                  </label>
                  <input
                    type="text"
                    value={participantFormData.contact}
                    onChange={(e) => setParticipantFormData({ ...participantFormData, contact: e.target.value })}
                    className="input-field"
                    placeholder="Enter contact information"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={participantFormData.notes}
                    onChange={(e) => setParticipantFormData({ ...participantFormData, notes: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Additional notes"
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingParticipant ? 'Update' : 'Add'} Participant
                  </button>
                  <button
                    type="button"
                    onClick={resetParticipantForm}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Prize Modal */}
      {isPrizeModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="mt-3">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                {editingPrize ? 'Edit Prize' : 'Add New Prize'}
              </h3>
              <form onSubmit={handlePrizeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <input
                    type="text"
                    required
                    value={prizeFormData.position}
                    onChange={(e) => setPrizeFormData({ ...prizeFormData, position: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 1st, 2nd, 3rd, Best Performance"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event *
                  </label>
                  <select
                    required
                    value={prizeFormData.eventId}
                    onChange={(e) => setPrizeFormData({ ...prizeFormData, eventId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select event</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prize Type *
                  </label>
                  <select
                    required
                    value={prizeFormData.type}
                    onChange={(e) => setPrizeFormData({ ...prizeFormData, type: e.target.value })}
                    className="input-field"
                  >
                    {prizeTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={prizeFormData.amount}
                    onChange={(e) => setPrizeFormData({ ...prizeFormData, amount: e.target.value })}
                    className="input-field"
                    placeholder="Enter prize amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Winner
                  </label>
                  <select
                    value={prizeFormData.winnerId}
                    onChange={(e) => setPrizeFormData({ ...prizeFormData, winnerId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select winner</option>
                    {participants.map((participant) => (
                      <option key={participant.id} value={participant.id}>
                        {participant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sponsor
                  </label>
                  <select
                    value={prizeFormData.sponsorId}
                    onChange={(e) => setPrizeFormData({ ...prizeFormData, sponsorId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select sponsor</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={prizeFormData.description}
                    onChange={(e) => setPrizeFormData({ ...prizeFormData, description: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Enter prize description"
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingPrize ? 'Update' : 'Add'} Prize
                  </button>
                  <button
                    type="button"
                    onClick={resetPrizeForm}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
