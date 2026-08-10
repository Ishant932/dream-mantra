import { useState, useEffect, useCallback } from 'react';
import { Layers, Plus } from 'lucide-react';
import { adminApi } from '../../api';
import { SKILL_MAPPING_INSTRUMENT_IDS, SKILL_MAPPING_INSTRUMENT_META, formatInstrumentList } from '../../data/skillMappingInstruments';
import { DashCard } from '../DashboardUI';

export default function AdminAgewiseCombosPanel({ token, onNotice, onError }) {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [instruments, setInstruments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminApi.skillMappingCombos(token);
      setCombos(data.combos || []);
    } catch (e) {
      onError?.(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, onError]);

  useEffect(() => { load(); }, [load]);

  const toggleInstrument = (id) => {
    setInstruments((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const resetForm = () => {
    setName('');
    setInstruments([]);
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !instruments.length) {
      onError?.('Name and at least one instrument are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await adminApi.updateSkillMappingCombo(token, editing.id, { name: name.trim(), instruments });
        onNotice?.('Combo updated');
      } else {
        await adminApi.createSkillMappingCombo(token, { name: name.trim(), instruments });
        onNotice?.('Combo created');
      }
      resetForm();
      await load();
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (combo) => {
    setEditing(combo);
    setName(combo.name);
    setInstruments(combo.instruments || []);
  };

  const toggleActive = async (combo) => {
    try {
      await adminApi.updateSkillMappingCombo(token, combo.id, { active: combo.active === false });
      onNotice?.(combo.active === false ? 'Combo activated' : 'Combo deactivated');
      await load();
    } catch (e) {
      onError?.(e.message);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <DashCard className="!p-5" glow={false} hover={false}>
        <h2 className="text-lg font-bold flex items-center gap-2 mb-1">
          <Layers className="w-5 h-5 text-amber-500" /> Agewise Bifurcation
        </h2>
        <p className="text-sm opacity-70 mb-4">
          Create any instrument mix. Combos appear at checkout — users only see the tests you select in their combo.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold block mb-1">Name</label>
            <input
              className="input-field w-full"
              placeholder="e.g. Class 1–5, XYZ Coaching, Class 9–12"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">Instruments ({instruments.length} selected)</p>
            <div className="flex flex-wrap gap-2">
              {SKILL_MAPPING_INSTRUMENT_IDS.map((id) => {
                const on = instruments.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleInstrument(id)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${on ? 'bg-amber-600 text-white border-amber-600' : 'border-sand-300 opacity-80 hover:border-amber-400'}`}
                  >
                    {SKILL_MAPPING_INSTRUMENT_META[id]?.short || id}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> {saving ? 'Saving…' : editing ? 'Update combo' : 'Create combo'}
            </button>
            {editing && (
              <button type="button" className="btn-outline" onClick={resetForm}>Cancel edit</button>
            )}
          </div>
        </form>
      </DashCard>

      {loading ? (
        <p className="text-sm opacity-60">Loading combos…</p>
      ) : (
        <div className="space-y-2">
          {combos.map((combo) => (
            <DashCard key={combo.id} className="!p-4 !overflow-visible" glow={false} hover={false}>
              <div className="admin-settings-row">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold">{combo.name}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${combo.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-sand-200 text-sand-600'}`}>
                      {combo.active !== false ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sand-100 text-sand-700">
                      {combo.instruments?.length || 0} instruments
                    </span>
                  </div>
                  <p className="text-sm opacity-70">{formatInstrumentList(combo.instruments)}</p>
                </div>
                <div className="admin-settings-row__actions">
                  <button type="button" className="btn-outline !py-1.5 !px-3 text-sm" onClick={() => startEdit(combo)}>Edit</button>
                  <button type="button" className="btn-outline !py-1.5 !px-3 text-sm" onClick={() => toggleActive(combo)}>
                    {combo.active !== false ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </DashCard>
          ))}
        </div>
      )}
    </div>
  );
}
