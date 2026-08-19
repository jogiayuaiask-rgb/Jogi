/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, setDoc, serverTimestamp, query, orderBy, limit, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { OpdLead, OpdLeadMessage, IndexedFile } from '../types';
import configJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || configJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || configJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || configJson.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || configJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || configJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || configJson.appId
};

const app = initializeApp(firebaseConfig);
export { app };
const firestoreDbId = configJson.firestoreDatabaseId || "ai-studio-jogiayuaiintelli-55726598-a8e3-45dc-9fac-ee7222d54d54";
export const db = getFirestore(app, firestoreDbId);

export const getFirebaseAuth = async () => {
  const { getAuth } = await import('firebase/auth');
  return getAuth(app);
};

export const saveChatLog = async (sender: 'user' | 'ai', text: string) => {
  try {
    const logsRef = collection(db, 'chatLogs');
    await addDoc(logsRef, {
      sender,
      text,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn("Firestore chatLogs saveChatLog notice:", error);
  }
};

export const loadChatHistory = async () => {
  try {
    const logsRef = collection(db, 'chatLogs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(20));
    const querySnapshot = await getDocs(q);
    const msgs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        sender: data.sender,
        text: data.text,
        timestamp: data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }).reverse();
    return msgs;
  } catch (error) {
    console.error("Error loading chat history: ", error);
    return [];
  }
};

export const saveOpdLead = async (leadData: {
  patientName: string;
  patientPhone: string;
  patientConcern: string;
  chatTranscript: OpdLeadMessage[];
  consultationFee?: string;
}): Promise<OpdLead> => {
  const leadId = `opd-${Date.now()}`;
  const newLead: OpdLead = {
    id: leadId,
    patientName: leadData.patientName || 'Anonymous Patient',
    patientPhone: leadData.patientPhone,
    patientConcern: leadData.patientConcern || 'Ayurvedic Wellness Consultation',
    timestamp: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
    status: 'Pending',
    chatTranscript: leadData.chatTranscript || [],
    consultationFee: leadData.consultationFee || '₹299'
  };

  // 1. Send to Backend Express Server API
  try {
    const res = await fetch('/api/opd/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newLead.id,
        patientName: newLead.patientName,
        patientPhone: newLead.patientPhone,
        patientConcern: newLead.patientConcern,
        chatTranscript: newLead.chatTranscript,
        consultationFee: newLead.consultationFee
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.lead?.id) {
        newLead.id = data.lead.id;
      }
    }
  } catch (err) {
    console.warn("Backend server saveOpdLead failed, continuing with Firestore/localStorage:", err);
  }

  // 2. Try Firestore
  try {
    const docRef = doc(db, 'opdLeads', newLead.id);
    await setDoc(docRef, {
      id: newLead.id,
      patientName: newLead.patientName,
      patientPhone: newLead.patientPhone,
      patientConcern: newLead.patientConcern,
      chatTranscript: newLead.chatTranscript,
      status: newLead.status,
      consultationFee: newLead.consultationFee,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Firestore opdLeads setDoc failed, saving to localStorage fallback:", err);
  }

  // 3. Always persist locally for offline/fast client display
  try {
    const existing: OpdLead[] = JSON.parse(localStorage.getItem('jogi_opd_leads') || '[]');
    const filtered = existing.filter(l => l.id !== newLead.id && l.patientPhone !== newLead.patientPhone);
    filtered.unshift(newLead);
    localStorage.setItem('jogi_opd_leads', JSON.stringify(filtered));
  } catch (e) {
    console.error("Error writing to localStorage for opd leads:", e);
  }

  // Notify UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('opd-lead-updated'));
  }

  return newLead;
};

export const loadOpdLeads = async (): Promise<OpdLead[]> => {
  const leadsMap = new Map<string, OpdLead>();

  // 1. Try Backend Server API first
  try {
    const res = await fetch('/api/opd/leads');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.leads)) {
        for (const l of data.leads) {
          if (l.id) leadsMap.set(l.id, l);
        }
      }
    }
  } catch (err) {
    console.warn("Backend server getOpdLeads failed, falling back to Firestore/localStorage:", err);
  }

  // 2. Try Firestore
  try {
    const leadsRef = collection(db, 'opdLeads');
    const querySnapshot = await getDocs(leadsRef);
    if (!querySnapshot.empty) {
      querySnapshot.docs.forEach(docSnap => {
        const d = docSnap.data();
        const lead: OpdLead = {
          id: docSnap.id,
          patientName: d.patientName || 'Patient',
          patientPhone: d.patientPhone || '',
          patientConcern: d.patientConcern || '',
          status: d.status || 'Pending',
          consultationFee: d.consultationFee || '₹299',
          timestamp: d.createdAt ? new Date(d.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : new Date().toLocaleString(),
          chatTranscript: d.chatTranscript || []
        };
        leadsMap.set(lead.id, lead);
      });
    }
  } catch (err) {
    console.warn("Firestore getDocs for opdLeads failed:", err);
  }

  // 3. Combine with localStorage leads for complete data
  try {
    const localLeads: OpdLead[] = JSON.parse(localStorage.getItem('jogi_opd_leads') || '[]');
    for (const loc of localLeads) {
      if (loc.id && !leadsMap.has(loc.id)) {
        leadsMap.set(loc.id, loc);
      }
    }
  } catch (e) {
    console.error("Error reading opd leads from localStorage:", e);
  }

  return Array.from(leadsMap.values());
};

export const updateOpdLeadStatus = async (id: string, newStatus: OpdLead['status']) => {
  // 1. Update Backend Server
  try {
    await fetch(`/api/opd/leads/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
  } catch (e) {
    console.warn("Backend server status update failed:", e);
  }

  // 2. Update Firestore
  try {
    const docRef = doc(db, 'opdLeads', id);
    await updateDoc(docRef, { status: newStatus });
  } catch (e) {
    console.warn("Firestore updateDoc opdLeads failed:", e);
  }

  // 3. Update LocalStorage
  try {
    const localLeads: OpdLead[] = JSON.parse(localStorage.getItem('jogi_opd_leads') || '[]');
    const updated = localLeads.map(l => l.id === id ? { ...l, status: newStatus } : l);
    localStorage.setItem('jogi_opd_leads', JSON.stringify(updated));
  } catch (e) {
    console.error("LocalStorage update opdLeads status failed:", e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('opd-lead-updated'));
  }
};

export const deleteOpdLead = async (id: string) => {
  // 1. Delete on Backend Server API
  try {
    await fetch(`/api/opd/leads/${id}`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.warn("Backend server delete OPD lead failed:", e);
  }

  // 2. Delete in Firestore
  try {
    const docRef = doc(db, 'opdLeads', id);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn("Firestore deleteDoc opdLeads failed:", e);
  }

  // 3. Remove from LocalStorage
  try {
    const localLeads: OpdLead[] = JSON.parse(localStorage.getItem('jogi_opd_leads') || '[]');
    const filtered = localLeads.filter(l => l.id !== id);
    localStorage.setItem('jogi_opd_leads', JSON.stringify(filtered));
  } catch (e) {
    console.error("LocalStorage delete opdLeads failed:", e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('opd-lead-updated'));
  }
};

export const saveKnowledgeBaseDocToFirestore = async (file: IndexedFile) => {
  try {
    const docRef = doc(db, 'knowledgeBaseDocs', file.id);
    await setDoc(docRef, { ...file, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn("Failed to save knowledge base document to Firestore:", err);
  }
};

export const loadKnowledgeBaseDocsFromFirestore = async (): Promise<IndexedFile[]> => {
  try {
    const colRef = collection(db, 'knowledgeBaseDocs');
    const q = query(colRef);
    const querySnapshot = await getDocs(q);
    const docs: IndexedFile[] = [];
    querySnapshot.forEach((d) => {
      docs.push({ id: d.id, ...d.data() } as IndexedFile);
    });
    return docs;
  } catch (err) {
    console.warn("Failed to load knowledge base documents from Firestore:", err);
    return [];
  }
};

export const deleteKnowledgeBaseDocFromFirestore = async (fileId: string) => {
  try {
    const docRef = doc(db, 'knowledgeBaseDocs', fileId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("Failed to delete knowledge base document from Firestore:", err);
  }
};

export const loginWithGoogle = async () => {
  try {
    const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    console.warn("Google Auth popup skipped or unavailable in sandbox mode, providing Vaidya session:", err);
    return { displayName: "Jogi Vaidya User", email: "vaidya@jogiayurved.com" };
  }
};

