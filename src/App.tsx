import { useState, useCallback, useRef, useEffect } from 'react';
import type { Node, Edge, NodeMouseHandler, OnNodeDrag } from '@xyflow/react';
import {
  ReactFlow, Controls, MiniMap, Background, BackgroundVariant,
  useNodesState, useEdgesState, useReactFlow, ReactFlowProvider,
} from '@xyflow/react';
import type { FamilyData, Person, RelationshipType, Gender } from './types';
import {
  loadData, createPerson, updatePerson, deletePerson,
  addRelationship, deleteRelationship,
  exportToFile, importFromFile, importToDb,
} from './api';
import { buildFlowGraph, buildFocusedGraph } from './treeLayout';
import { genderColors } from './theme';
import PersonNode from './components/PersonNode';
import FamilyEdge from './components/FamilyEdge';
import MoreNode from './components/MoreNode';
import Avatar from './components/Avatar';
import PersonForm from './components/PersonForm';
import PersonPanel from './components/PersonPanel';
import RelationshipForm from './components/RelationshipForm';
import ConfirmDialog from './components/ConfirmDialog';
import QuickAddModal from './components/QuickAddModal';
import LoginScreen from './components/LoginScreen';
import UserMenu from './components/UserMenu';
import ClaimProfileModal from './components/ClaimProfileModal';
import { getCurrentUser, logout as logoutUser, getFamilyName, updateFamilyName, linkPerson, type AuthUser } from './auth';
import { Search, Plus, Download, Upload, TreePine, Users, Loader2, Pencil, Maximize2, Home, ChevronRight, Network } from 'lucide-react';

const nodeTypes = { personNode: PersonNode, moreNode: MoreNode };
const edgeTypes = { familyEdge: FamilyEdge };
const DEPTH_OPTIONS = [2, 3, 4] as const;

function FamilyTreeApp() {
  const [authUser, setAuthUser] = useState<AuthUser | null | undefined>(undefined);
  const [familyName, setFamilyName] = useState('My Family Tree');
  const [editingFamilyName, setEditingFamilyName] = useState(false);
  const [familyNameDraft, setFamilyNameDraft] = useState('');
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [focusDepth, setFocusDepth] = useState<number>(3);
  const [trail, setTrail] = useState<{ id: string; name: string }[]>([]);
  const [showClaimProfile, setShowClaimProfile] = useState(false);
  const [claimAfterAdd, setClaimAfterAdd] = useState(false);
  const [showFullTree, setShowFullTree] = useState(false);
  const { fitView, setCenter } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check auth on mount. A failed check (network error, etc.) is treated as
  // logged-out rather than leaving the app stuck on the loading spinner.
  useEffect(() => {
    getCurrentUser().then(setAuthUser).catch(() => setAuthUser(null));
  }, []);

  // Load data once authenticated
  useEffect(() => {
    if (!authUser) return;
    loadData().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
    getFamilyName().then(setFamilyName).catch(() => {});
  }, [authUser]);

  async function handleLogout() {
    await logoutUser();
    setAuthUser(null);
    setData({ people: [], relationships: [] });
    setSelectedPerson(null);
    setTrail([]);
  }

  // Re-centers the graph on `person` and updates the navigation trail: if
  // `person` is already in the trail (e.g. clicking a breadcrumb, or a node
  // you've visited before) the trail truncates back to that point instead of
  // growing forever; otherwise it's appended as a new hop. `resetTrail`
  // starts a fresh trail rooted at `person` — used when jumping Home.
  const focusOn = useCallback((person: Person, opts?: { resetTrail?: boolean }) => {
    setSelectedPerson(person);
    setShowFullTree(false);
    setTrail(prev => {
      if (opts?.resetTrail) return [{ id: person.id, name: person.name }];
      const idx = prev.findIndex(t => t.id === person.id);
      if (idx !== -1) return prev.slice(0, idx + 1);
      return [...prev, { id: person.id, name: person.name }];
    });
  }, []);

  function goHome() {
    setShowFullTree(false);
    const me = data.people.find(p => p.id === authUser?.linkedPersonId);
    if (me) focusOn(me, { resetTrail: true });
  }

  // Every login must resolve to a specific node — the default view is always
  // "my family circle", never the whole tree. Once linked, land on that
  // person automatically; if not yet linked (and the tree isn't empty),
  // prompt them to claim their profile before showing anything.
  useEffect(() => {
    if (loading || selectedPerson || showFullTree) return;
    if (authUser?.linkedPersonId) {
      const me = data.people.find(p => p.id === authUser.linkedPersonId);
      if (me) { focusOn(me, { resetTrail: true }); return; }
    }
    if (authUser && !authUser.linkedPersonId && data.people.length > 0) {
      setShowClaimProfile(true);
    }
  }, [authUser, data.people, loading, selectedPerson, showFullTree, focusOn]);

  async function handleClaim(personId: string) {
    try {
      await linkPerson(personId);
      setAuthUser(u => (u ? { ...u, linkedPersonId: personId } : u));
      setShowClaimProfile(false);
      const person = data.people.find(p => p.id === personId);
      if (person) focusOn(person, { resetTrail: true });
    } catch {
      alert('Could not link your profile. Please try again.');
    }
  }

  function handleClaimCreateNew() {
    setShowClaimProfile(false);
    setClaimAfterAdd(true);
    setShowAddPerson(true);
  }

  function startEditFamilyName() {
    setFamilyNameDraft(familyName);
    setEditingFamilyName(true);
  }

  async function saveFamilyName() {
    const trimmed = familyNameDraft.trim();
    setEditingFamilyName(false);
    if (!trimmed || trimmed === familyName) return;
    try {
      setFamilyName(await updateFamilyName(trimmed));
    } catch {
      alert('Could not update family name. Please try again.');
    }
  }

  // Rebuild the graph whenever the data changes or the focused person changes.
  // Selecting someone re-centers the whole layout on them (parents/grandparents
  // above, spouse/siblings/cousins alongside, children/grandchildren below);
  // clearing the selection returns to the fixed default tree.
  const prevFocusId = useRef<string | null>(null);
  useEffect(() => {
    const focusId = showFullTree ? null : selectedPerson?.id ?? null;
    const { nodes: n, edges: e } = focusId
      ? buildFocusedGraph(focusId, data.people, data.relationships, focusDepth)
      : buildFlowGraph(data.people, data.relationships);
    setNodes(n);
    setEdges(e);

    const focusChanged = focusId !== prevFocusId.current;
    prevFocusId.current = focusId;
    if (!focusChanged) return;

    const timer = setTimeout(() => {
      if (focusId) {
        const node = n.find(x => x.id === focusId);
        if (node) setCenter(node.position.x + 90, node.position.y + 45, { zoom: 1.15, duration: 500 });
      } else {
        fitView({ padding: 0.2, duration: 500 });
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [data, selectedPerson?.id, focusDepth, showFullTree]);

  // Search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    setSearchResults(data.people.filter(p => p.name.toLowerCase().includes(q)));
  }, [searchQuery, data.people]);

  const handleNodeClick: NodeMouseHandler = useCallback((_evt, node) => {
    // A "+N" chip shares its boundary person's id (prefixed) — clicking it
    // re-centers on that person too, which is what reveals their hidden relatives.
    const targetId = node.id.startsWith('more-') ? node.id.slice(5) : node.id;
    const person = data.people.find(p => p.id === targetId);
    if (person) focusOn(person);
  }, [data.people, focusOn]);

  // Persist a manual drag so it survives the next layout rebuild. Only in the
  // default (unfocused) view — the focused view's coordinates are relative to
  // whoever is centered, so they can't be reused as an absolute saved position.
  const handleNodeDragStop: OnNodeDrag = useCallback((_evt, node) => {
    if (selectedPerson || node.id.startsWith('more-')) return;
    const person = data.people.find(p => p.id === node.id);
    if (!person) return;
    updatePerson(data, node.id, { posX: node.position.x, posY: node.position.y })
      .then(setData)
      .catch(() => {});
  }, [data, selectedPerson]);

  function centerOnPerson(personId: string) {
    const node = nodes.find(n => n.id === personId);
    if (node) setCenter(node.position.x + 90, node.position.y + 45, { zoom: 1.2, duration: 600 });
  }

  // ── CRUD handlers ──────────────────────────────────────────────────
  async function handleAddPerson(personData: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const { data: newData, person } = await createPerson(data, personData);
      setData(newData);
      setShowAddPerson(false);
      if (claimAfterAdd) {
        setClaimAfterAdd(false);
        await handleClaim(person.id);
      } else {
        setTimeout(() => centerOnPerson(person.id), 300);
      }
    } catch {
      alert('Could not add person. Please try again.');
    }
  }

  async function handleEditPerson(personData: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!selectedPerson) return;
    try {
      const newData = await updatePerson(data, selectedPerson.id, personData);
      setData(newData);
      setSelectedPerson({ ...selectedPerson, ...personData });
      setShowEditPerson(false);
    } catch {
      alert('Could not save changes. Please try again.');
    }
  }

  async function handleDeletePerson() {
    if (!confirmDelete) return;
    try {
      const newData = await deletePerson(data, confirmDelete);
      setData(newData);
      setConfirmDelete(null);
      if (selectedPerson?.id === confirmDelete) setSelectedPerson(null);
    } catch {
      alert('Could not delete person. Please try again.');
    }
  }

  async function handleAddRelationship(relatedPersonId: string, type: RelationshipType) {
    if (!selectedPerson) return;
    try {
      const newData = await addRelationship(data, selectedPerson.id, relatedPersonId, type);
      setData(newData);
      setShowAddRelationship(false);
    } catch {
      alert('Could not add relationship. Please try again.');
    }
  }

  async function handleDeleteRelationship(relId: string) {
    try {
      setData(await deleteRelationship(data, relId));
    } catch {
      alert('Could not delete relationship. Please try again.');
    }
  }

  async function handleQuickAddCreate(name: string, gender: Gender, relType: RelationshipType) {
    if (!selectedPerson) return;
    try {
      const { data: d1saved } = await createPerson(data, { name, gender });
      const newPerson = d1saved.people[d1saved.people.length - 1];
      const d2 = await addRelationship(d1saved, selectedPerson.id, newPerson.id, relType);
      setData(d2);
      setShowQuickAdd(false);
      setTimeout(() => centerOnPerson(newPerson.id), 300);
    } catch {
      alert('Could not add person. Please try again.');
    }
  }

  async function handleQuickAddExisting(existingId: string, relType: RelationshipType) {
    if (!selectedPerson) return;
    try {
      setData(await addRelationship(data, selectedPerson.id, existingId, relType));
      setShowQuickAdd(false);
    } catch {
      alert('Could not add relationship. Please try again.');
    }
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

  if (authUser === undefined) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (authUser === null) {
    return <LoginScreen />;
  }

  const anyModalOpen = showAddPerson || showEditPerson || showAddRelationship || showQuickAdd || !!confirmDelete || showClaimProfile;

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="z-[100] flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/95 px-3 shadow-sm backdrop-blur sm:px-5">
        <div className="flex min-w-0 shrink items-center gap-2">
          <TreePine size={22} className="shrink-0 text-indigo-500" />
          {editingFamilyName ? (
            <input
              autoFocus
              value={familyNameDraft}
              onChange={e => setFamilyNameDraft(e.target.value)}
              onBlur={saveFamilyName}
              onKeyDown={e => { if (e.key === 'Enter') saveFamilyName(); if (e.key === 'Escape') setEditingFamilyName(false); }}
              className="w-40 rounded-lg border-[1.5px] border-indigo-400 px-2 py-0.5 text-[15px] font-extrabold tracking-tight text-slate-900 outline-none sm:w-48"
            />
          ) : (
            <button onClick={startEditFamilyName} title="Edit family name" className="group flex min-w-0 items-center gap-1.5 rounded-lg px-1 py-0.5 transition-colors hover:bg-slate-100">
              <span className="truncate text-[15px] font-extrabold tracking-tight text-slate-900 sm:text-base">{familyName}</span>
              <Pencil size={11} className="shrink-0 text-slate-300 group-hover:text-slate-400" />
            </button>
          )}
        </div>

        {/* Desktop search */}
        <div className="relative hidden max-w-[280px] flex-1 sm:block">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            placeholder="Search family members..."
            className="w-full rounded-lg border-[1.5px] border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-[13px] outline-none transition-colors focus:border-indigo-400 focus:bg-white"
          />
          {showSearch && searchResults.length > 0 && (
            <div className="animate-scale-in absolute left-0 right-0 top-[calc(100%+6px)] z-[300] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              {searchResults.slice(0, 6).map(p => (
                <button
                  key={p.id}
                  onClick={() => { focusOn(p); setSearchQuery(''); }}
                  className="flex w-full items-center gap-2.5 border-b border-slate-100 px-3.5 py-2 text-left transition-colors last:border-b-0 hover:bg-slate-50"
                >
                  <Avatar photo={p.photo} name={p.name} gender={p.gender} size={28} />
                  <span className="truncate text-[13px] font-semibold text-slate-900">{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Mobile search toggle */}
          <button onClick={() => setMobileSearchOpen(o => !o)} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 sm:hidden" title="Search">
            <Search size={16} />
          </button>

          <span className="hidden items-center gap-1.5 text-[13px] font-medium text-slate-400 md:flex">
            <Users size={14} /> {data.people.length} {data.people.length === 1 ? 'person' : 'people'}
          </span>

          {authUser.linkedPersonId && (
            <button onClick={goHome} title="Back to my family circle" className="flex items-center gap-1.5 rounded-lg border-[1.5px] border-slate-200 px-2 py-1.5 text-[13px] font-semibold text-slate-500 transition-all duration-150 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 sm:px-3">
              <Home size={14} /><span className="hidden lg:inline">Me</span>
            </button>
          )}
          <button
            onClick={() => setShowFullTree(v => !v)}
            title={showFullTree ? 'Back to my family circle' : 'View the entire family tree'}
            className={`flex items-center gap-1.5 rounded-lg border-[1.5px] px-2 py-1.5 text-[13px] font-semibold transition-all duration-150 active:scale-95 sm:px-3 ${
              showFullTree ? 'border-indigo-300 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Network size={14} /><span className="hidden lg:inline">Full Tree</span>
          </button>

          <button onClick={() => exportToFile(data)} title="Export" className="flex items-center gap-1.5 rounded-lg border-[1.5px] border-slate-200 px-2 py-1.5 text-[13px] font-semibold text-slate-500 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-95 sm:px-3">
            <Download size={14} /><span className="hidden lg:inline">Export</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} title="Import" className="flex items-center gap-1.5 rounded-lg border-[1.5px] border-slate-200 px-2 py-1.5 text-[13px] font-semibold text-slate-500 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-95 sm:px-3">
            <Upload size={14} /><span className="hidden lg:inline">Import</span>
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

          <button onClick={() => setShowAddPerson(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[13px] font-bold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 hover:shadow-md active:scale-95 sm:px-4">
            <Plus size={16} /><span className="hidden sm:inline">Add Person</span>
          </button>

          <UserMenu user={authUser} onLogout={handleLogout} onChangeProfile={() => setShowClaimProfile(true)} />
        </div>
      </header>

      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="animate-fade-in absolute inset-x-0 top-14 z-[200] border-b border-slate-200 bg-white p-3 shadow-lg sm:hidden">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search family members..."
              className="w-full rounded-lg border-[1.5px] border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-100">
              {searchResults.slice(0, 8).map(p => (
                <button
                  key={p.id}
                  onClick={() => { focusOn(p); setSearchQuery(''); setMobileSearchOpen(false); }}
                  className="flex w-full items-center gap-2.5 border-b border-slate-100 px-3 py-2.5 text-left last:border-b-0 hover:bg-slate-50"
                >
                  <Avatar photo={p.photo} name={p.name} gender={p.gender} size={28} />
                  <span className="truncate text-[13px] font-semibold text-slate-900">{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main */}
      <div className="relative flex-1 overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
            <span className="text-sm text-slate-400">Loading your family tree…</span>
          </div>
        ) : data.people.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50">
              <TreePine size={36} className="text-indigo-400" />
            </div>
            <h2 className="m-0 text-2xl font-extrabold text-slate-900">Build Your Family Tree</h2>
            <p className="m-0 max-w-xs text-[15px] text-slate-400">Start with yourself — everyone else's place in the tree is worked out from there.</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2.5">
              <button onClick={() => { setClaimAfterAdd(true); setShowAddPerson(true); }} className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-[15px] font-bold text-white shadow-md transition-all duration-150 hover:bg-indigo-700 hover:shadow-lg active:scale-95">
                <Plus size={18} /> Add Myself
              </button>
              <button onClick={() => setShowAddPerson(true)} className="flex items-center gap-2 rounded-2xl border-[1.5px] border-slate-200 bg-white px-5 py-3 text-[14px] font-semibold text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-95">
                Add Someone Else
              </button>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={handleNodeClick}
            onNodeDragStop={handleNodeDragStop}
            fitView fitViewOptions={{ padding: 0.2 }}
            minZoom={0.1} maxZoom={2.5}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#e2e8f0" />
            <Controls showInteractive={false} />
            <MiniMap
              className="!hidden sm:!block"
              nodeColor={(n) => {
                const p = data.people.find(x => x.id === n.id);
                return p ? genderColors(p.gender).solid : '#cbd5e1';
              }}
              style={{ bottom: 80, right: 16 }}
            />
          </ReactFlow>
        )}

        {!loading && data.people.length > 0 && (
          <button
            onClick={() => fitView({ padding: 0.15, duration: 500 })}
            className="absolute bottom-5 right-5 z-10 flex items-center gap-1.5 rounded-lg border-[1.5px] border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-md transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-95"
          >
            <Maximize2 size={12} /> Fit to Screen
          </button>
        )}

        {selectedPerson && !showFullTree && !anyModalOpen && trail.length > 0 && (
          <div className="absolute left-5 top-5 z-10 flex max-w-[calc(100%-40px)] items-center gap-1 overflow-x-auto rounded-lg border-[1.5px] border-slate-200 bg-white px-2 py-1.5 shadow-md">
            {trail.map((t, i) => (
              <span key={t.id} className="flex shrink-0 items-center gap-1">
                {i > 0 && <ChevronRight size={12} className="shrink-0 text-slate-300" />}
                <button
                  onClick={() => {
                    const p = data.people.find(x => x.id === t.id);
                    if (p) { setSelectedPerson(p); setTrail(trail.slice(0, i + 1)); }
                  }}
                  className={`whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold transition-colors duration-150 ${
                    i === trail.length - 1 ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {t.id === authUser.linkedPersonId ? 'Me' : t.name}
                </button>
              </span>
            ))}
          </div>
        )}

        {selectedPerson && !showFullTree && !anyModalOpen && (
          <div className="absolute right-5 top-5 z-10 flex items-center gap-1.5 rounded-lg border-[1.5px] border-slate-200 bg-white px-2 py-1.5 shadow-md">
            <span className="px-1 text-[11px] font-semibold text-slate-400">Depth</span>
            {DEPTH_OPTIONS.map(d => (
              <button
                key={d}
                onClick={() => setFocusDepth(d)}
                className={`rounded-md px-2 py-1 text-xs font-bold transition-colors duration-150 ${
                  focusDepth === d ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => setFocusDepth(Infinity)}
              className={`rounded-md px-2 py-1 text-xs font-bold transition-colors duration-150 ${
                !Number.isFinite(focusDepth) ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              All
            </button>
          </div>
        )}
      </div>

      {/* Side panel */}
      {selectedPerson && !anyModalOpen && (
        <PersonPanel
          person={selectedPerson} people={data.people} relationships={data.relationships}
          onEdit={() => setShowEditPerson(true)}
          onDelete={() => setConfirmDelete(selectedPerson.id)}
          onAddRelationship={() => setShowAddRelationship(true)}
          onQuickAdd={() => setShowQuickAdd(true)}
          onDeleteRelationship={handleDeleteRelationship}
          onSelectPerson={id => { const p = data.people.find(x => x.id === id); if (p) focusOn(p); }}
          onClose={() => (authUser?.linkedPersonId ? goHome() : setSelectedPerson(null))}
          myPersonId={authUser?.linkedPersonId ?? null}
        />
      )}

      {showAddPerson && <PersonForm title={claimAfterAdd ? 'Add Yourself' : 'Add Person'} onSave={handleAddPerson} onCancel={() => { setShowAddPerson(false); setClaimAfterAdd(false); }} />}
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
      {showClaimProfile && (
        <ClaimProfileModal people={data.people} onClaim={handleClaim} onCreateNew={handleClaimCreateNew} />
      )}
    </div>
  );
}

export default function App() {
  return <ReactFlowProvider><FamilyTreeApp /></ReactFlowProvider>;
}
