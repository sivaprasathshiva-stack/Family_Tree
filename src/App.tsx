import { useState, useCallback, useRef, useEffect } from 'react';
import type { Node, Edge, NodeMouseHandler } from '@xyflow/react';
import {
  ReactFlow, Controls, MiniMap, Background, BackgroundVariant,
  useNodesState, useEdgesState, useReactFlow, ReactFlowProvider,
} from '@xyflow/react';
import type { FamilyData, Person, RelationshipType, Gender } from './types';
import {
  loadData, createPerson, updatePerson, deletePerson,
  addRelationship, deleteRelationship,
  generateId, exportToFile, importFromFile, importToDb,
} from './api';
import { buildFlowGraph } from './treeLayout';
import PersonNode from './components/PersonNode';
import PersonForm from './components/PersonForm';
import PersonPanel from './components/PersonPanel';
import RelationshipForm from './components/RelationshipForm';
import ConfirmDialog from './components/ConfirmDialog';
import QuickAddModal from './components/QuickAddModal';
import { Search, Plus, Download, Upload, TreePine, Users, Loader2 } from 'lucide-react';

const nodeTypes = { personNode: PersonNode };

function FamilyTreeApp() {
  const [data, setData] = useState<FamilyData>({ people: [], relationships: [] });
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showEditPerson, setShowEditPerson] = useState(false);
  const [showAddRelationship, setShowAddRelationship] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const { fitView, setCenter } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data on mount
  useEffect(() => {
    loadData().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  // Rebuild graph
  useEffect(() => {
    const { nodes: n, edges: e } = buildFlowGraph(data.people, data.relationships);
    setNodes(n);
    setEdges(e);
  }, [data]);

  // Search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    setSearchResults(data.people.filter(p => p.name.toLowerCase().includes(q)));
  }, [searchQuery, data.people]);

  const handleNodeClick: NodeMouseHandler = useCallback((_evt, node) => {
    const person = data.people.find(p => p.id === node.id);
    if (person) setSelectedPerson(person);
  }, [data.people]);

  function centerOnPerson(personId: string) {
    const node = nodes.find(n => n.id === personId);
    if (node) setCenter(node.position.x + 90, node.position.y + 45, { zoom: 1.2, duration: 600 });
  }

  // ── CRUD handlers ──────────────────────────────────────────────────
  async function handleAddPerson(personData: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data: newData, person } = await createPerson(data, personData);
    setData(newData);
    setShowAddPerson(false);
    setTimeout(() => centerOnPerson(person.id), 300);
  }

  async function handleEditPerson(personData: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!selectedPerson) return;
    const newData = await updatePerson(data, selectedPerson.id, personData);
    setData(newData);
    setSelectedPerson({ ...selectedPerson, ...personData });
    setShowEditPerson(false);
  }

  async function handleDeletePerson() {
    if (!confirmDelete) return;
    const newData = await deletePerson(data, confirmDelete);
    setData(newData);
    setConfirmDelete(null);
    if (selectedPerson?.id === confirmDelete) setSelectedPerson(null);
  }

  async function handleAddRelationship(relatedPersonId: string, type: RelationshipType) {
    if (!selectedPerson) return;
    const newData = await addRelationship(data, selectedPerson.id, relatedPersonId, type);
    setData(newData);
    setShowAddRelationship(false);
  }

  async function handleDeleteRelationship(relId: string) {
    setData(await deleteRelationship(data, relId));
  }

  async function handleQuickAddCreate(name: string, gender: Gender, relType: RelationshipType) {
    if (!selectedPerson) return;
    const now = new Date().toISOString();
    const newPerson: Person = { id: generateId(), name, gender, createdAt: now, updatedAt: now };
    const d1: FamilyData = { ...data, people: [...data.people, newPerson] };
    // Save person to API first
    const { data: d1saved } = await createPerson(data, { name, gender });
    const d2 = await addRelationship(d1saved, selectedPerson.id, d1saved.people[d1saved.people.length - 1].id, relType);
    setData(d2);
    setShowQuickAdd(false);
    setTimeout(() => centerOnPerson(newPerson.id), 300);
  }

  async function handleQuickAddExisting(existingId: string, relType: RelationshipType) {
    if (!selectedPerson) return;
    setData(await addRelationship(data, selectedPerson.id, existingId, relType));
    setShowQuickAdd(false);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importFromFile(file);
      await importToDb(imported);
      setData(imported);
      setSelectedPerson(null);
    } catch {
      alert('Could not import file. Make sure it is a valid Family Tree JSON.');
    }
    e.target.value = '';
  }

  const hasRelationships = (id: string) =>
    data.relationships.some(r => r.personId === id || r.relatedPersonId === id);
  const personToDelete = confirmDelete ? data.people.find(p => p.id === confirmDelete) : null;

  const btnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
    border: '1.5px solid #e8e4de', borderRadius: '10px', background: '#fff',
    color: '#4a4540', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8f7f4' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 20px', height: 56, borderBottom: '1px solid #e8e4de', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', flexShrink: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}>
          <TreePine size={22} color="#3d7ab5" />
          <span style={{ fontWeight: 800, fontSize: '16px', color: '#1a1a1a', letterSpacing: '-0.02em' }}>My Family Tree</span>
        </div>

        <div style={{ flex: 1, maxWidth: 320, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#b0a89e' }} />
          <input
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            placeholder="Search family members..."
            style={{ width: '100%', padding: '7px 12px 7px 30px', border: '1.5px solid #e8e4de', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', background: '#f8f7f4' }}
          />
          {showSearch && searchResults.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#fff', border: '1.5px solid #e8e4de', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 300, overflow: 'hidden' }}>
              {searchResults.slice(0, 6).map(p => (
                <button key={p.id} onClick={() => { centerOnPerson(p.id); setSelectedPerson(p); setSearchQuery(''); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 14px', border: 'none', borderBottom: '1px solid #f0ede8', background: '#fff', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e8e4de', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {p.photo ? <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontWeight: 700, fontSize: '11px', color: '#6b5f54' }}>{p.name[0]}</span>}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#8c7c6a', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Users size={14} /> {data.people.length} {data.people.length === 1 ? 'person' : 'people'}
          </span>
          <button style={btnStyle} onClick={() => exportToFile(data)}><Download size={14} /> Export</button>
          <button style={btnStyle} onClick={() => fileInputRef.current?.click()}><Upload size={14} /> Import</button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          <button onClick={() => setShowAddPerson(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: 'none', borderRadius: '10px', background: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Plus size={16} /> Add Person
          </button>
        </div>
      </header>

      {/* Main */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Loader2 size={32} color="#3d7ab5" style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            <span style={{ fontSize: '14px', color: '#8c7c6a' }}>Loading your family tree…</span>
          </div>
        ) : data.people.length === 0 ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <div style={{ fontSize: '64px', lineHeight: 1 }}>🌳</div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#1a1a1a' }}>Build Your Family Tree</h2>
            <p style={{ margin: 0, fontSize: '15px', color: '#8c7c6a', maxWidth: 320, textAlign: 'center' }}>Start by adding yourself or the oldest family member.</p>
            <button onClick={() => setShowAddPerson(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', border: 'none', borderRadius: '12px', background: '#2563eb', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: '8px' }}>
              <Plus size={18} /> Add First Person
            </button>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onNodeClick={handleNodeClick}
            onPaneClick={() => setSelectedPerson(null)}
            fitView fitViewOptions={{ padding: 0.2 }}
            minZoom={0.1} maxZoom={2.5}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#e0dbd4" />
            <Controls showInteractive={false} />
            <MiniMap
              nodeColor={(n) => {
                const p = data.people.find(x => x.id === n.id);
                return p?.gender === 'male' ? '#7baed4' : p?.gender === 'female' ? '#d47baa' : '#c8bfb0';
              }}
              style={{ bottom: 80, right: 16 }}
            />
          </ReactFlow>
        )}

        {!loading && data.people.length > 0 && (
          <button onClick={() => fitView({ padding: 0.15, duration: 500 })} style={{ position: 'absolute', bottom: 20, right: 20, background: '#fff', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: '#4a4540', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 10 }}>
            Fit to Screen
          </button>
        )}
      </div>

      {/* Side panel */}
      {selectedPerson && !showAddPerson && !showEditPerson && !showAddRelationship && !showQuickAdd && !confirmDelete && (
        <PersonPanel
          person={selectedPerson} people={data.people} relationships={data.relationships}
          onEdit={() => setShowEditPerson(true)}
          onDelete={() => setConfirmDelete(selectedPerson.id)}
          onAddRelationship={() => setShowAddRelationship(true)}
          onDeleteRelationship={handleDeleteRelationship}
          onSelectPerson={id => { const p = data.people.find(x => x.id === id); if (p) { setSelectedPerson(p); centerOnPerson(id); } }}
          onClose={() => setSelectedPerson(null)}
        />
      )}

      {showAddPerson && <PersonForm title="Add Person" onSave={handleAddPerson} onCancel={() => setShowAddPerson(false)} />}
      {showEditPerson && selectedPerson && <PersonForm title="Edit Person" person={selectedPerson} onSave={handleEditPerson} onCancel={() => setShowEditPerson(false)} />}
      {showAddRelationship && selectedPerson && <RelationshipForm currentPerson={selectedPerson} people={data.people} onSave={handleAddRelationship} onCancel={() => setShowAddRelationship(false)} />}
      {showQuickAdd && selectedPerson && <QuickAddModal currentPerson={selectedPerson} people={data.people} onCreateAndRelate={handleQuickAddCreate} onRelateExisting={handleQuickAddExisting} onCancel={() => setShowQuickAdd(false)} />}
      {confirmDelete && personToDelete && (
        <ConfirmDialog
          title="Delete Person"
          message={`Are you sure you want to delete ${personToDelete.name}?`}
          warning={hasRelationships(personToDelete.id) ? `${personToDelete.name} has existing relationships. Deleting will also remove all their relationships.` : undefined}
          confirmLabel="Delete" confirmDanger
          onConfirm={handleDeletePerson} onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return <ReactFlowProvider><FamilyTreeApp /></ReactFlowProvider>;
}
