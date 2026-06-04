"use client";

import React, { useState } from "react";
import { 
  X, Plus, Trash2, Flame, Utensils, 
  Dumbbell, Droplet, Leaf, ChevronDown, ChevronUp, Pencil, Check
} from "lucide-react";

// Minimum calories from macros: protein*4 + carbs*4 + fat*9
function calcMinCalories(protein, fat, carbs) {
  return (Number(protein) || 0) * 4 + (Number(fat) || 0) * 9 + (Number(carbs) || 0) * 4;
}

// Clamp calorie value so it can't go below macro-derived minimum
function clampCalories(calories, protein, fat, carbs) {
  const min = calcMinCalories(protein, fat, carbs);
  return Math.max(Number(calories) || 0, min);
}

export default function MealsManager({ isOpen, onClose, meals, setMeals, saveMealsToDb }) {
  const [expandedMealId, setExpandedMealId] = useState(null);
  const [editingMealId, setEditingMealId] = useState(null); // which meal is in edit mode
  const [editDraft, setEditDraft] = useState(null); // draft state while editing
  const [addingMeal, setAddingMeal] = useState(false);
  const [newMeal, setNewMeal] = useState({ name: "", calories: "", protein: "", fat: "", carbs: "" });

  if (!isOpen) return null;

  // ── New meal form helpers ─────────────────────────────────────────────────

  const newMealMinCal = calcMinCalories(newMeal.protein, newMeal.fat, newMeal.carbs);
  const newMealCal = Number(newMeal.calories) || 0;
  const newCalTooLow = newMealCal > 0 && newMealCal < newMealMinCal;

  const handleAddMeal = () => {
    if (!newMeal.name.trim()) return;
    const protein = parseInt(newMeal.protein) || 0;
    const fat = parseInt(newMeal.fat) || 0;
    const carbs = parseInt(newMeal.carbs) || 0;
    const rawCal = parseInt(newMeal.calories) || 0;
    const calories = clampCalories(rawCal || newMealMinCal, protein, fat, carbs);

    const meal = { id: Date.now(), name: newMeal.name, calories, protein, fat, carbs };
    const updatedMeals = [...meals, meal];
    setMeals(updatedMeals);
    saveMealsToDb(updatedMeals);
    setAddingMeal(false);
    setNewMeal({ name: "", calories: "", protein: "", fat: "", carbs: "" });
  };

  // ── Existing meal helpers ─────────────────────────────────────────────────

  const startEdit = (meal, e) => {
    e.stopPropagation();
    setEditingMealId(meal.id);
    setEditDraft({ ...meal });
  };

  const cancelEdit = (e) => {
    e.stopPropagation();
    setEditingMealId(null);
    setEditDraft(null);
  };

  const saveEdit = (e) => {
    e.stopPropagation();
    if (!editDraft) return;
    const protein = parseInt(editDraft.protein) || 0;
    const fat = parseInt(editDraft.fat) || 0;
    const carbs = parseInt(editDraft.carbs) || 0;
    const calories = clampCalories(editDraft.calories, protein, fat, carbs);
    const updated = { ...editDraft, protein, fat, carbs, calories };

    const updatedMeals = meals.map(m => m.id === updated.id ? updated : m);
    setMeals(updatedMeals);
    saveMealsToDb(updatedMeals);
    setEditingMealId(null);
    setEditDraft(null);
  };

  const deleteMeal = (id, e) => {
    e.stopPropagation();
    const updatedMeals = meals.filter(m => m.id !== id);
    setMeals(updatedMeals);
    saveMealsToDb(updatedMeals);
    if (expandedMealId === id) setExpandedMealId(null);
    if (editingMealId === id) { setEditingMealId(null); setEditDraft(null); }
  };

  const draftMinCal = editDraft ? calcMinCalories(editDraft.protein, editDraft.fat, editDraft.carbs) : 0;
  const draftCalTooLow = editDraft && Number(editDraft.calories) > 0 && Number(editDraft.calories) < draftMinCal;

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

  // Shared input style helpers
  const readonlyCell = "w-full rounded-xl bg-transparent px-2 py-2 text-xs text-center font-bold select-none cursor-default";
  const editCell = "w-full rounded-xl bg-white/[0.04] border px-2 py-2 text-xs text-white text-center outline-none transition-all";

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-[95%] h-[95%] max-h-[800px] flex flex-col rounded-[24px] bg-[#030818] border border-[#00d0ff]/30 shadow-[0_0_50px_rgba(0,150,255,0.15)] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5 bg-[#030818] shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Utensils className="text-[#00d0ff]" size={20} />
              Meals Manager
            </h2>
            <p className="text-[10px] text-white/30 mt-0.5">
              {meals.length} meals · {totalCalories.toLocaleString()} kcal total today
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-9 w-9 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-90"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Add Meal Button */}
        {!addingMeal && (
          <div className="px-5 py-3 border-b border-white/5 bg-[#020b1e] shrink-0">
            <button
              onClick={() => setAddingMeal(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#00d0ff]/20 to-[#3b82f6]/20 border border-[#00d0ff]/40 text-[#00d0ff] hover:bg-[#00d0ff]/30 hover:shadow-[0_0_15px_rgba(0,208,255,0.2)] transition-all text-sm font-semibold"
            >
              <Plus size={16} />
              Add Meal
            </button>
          </div>
        )}

        {/* Inline Add Meal Form */}
        {addingMeal && (
          <div className="p-5 border-b border-[#00d0ff]/30 bg-[#07112c]/80 shrink-0 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white tracking-wide">New Meal</h3>
              <button onClick={() => { setAddingMeal(false); setNewMeal({ name: "", calories: "", protein: "", fat: "", carbs: "" }); }} className="text-white/40 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1 mb-1 block">Meal Name</label>
                <input
                  autoFocus
                  type="text"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                  placeholder="e.g. Soya chunks and rice"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[#00d0ff]/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {/* Protein */}
                <div>
                  <label className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#00d0ff] mb-1 block flex items-center gap-0.5"><Dumbbell size={9} /> Pro</label>
                  <input type="number" value={newMeal.protein} onChange={(e) => setNewMeal({ ...newMeal, protein: e.target.value })} placeholder="g" className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-2 py-2 text-xs text-white text-center outline-none focus:border-[#00d0ff]/50 transition-all" />
                </div>
                {/* Fat */}
                <div>
                  <label className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#38bdf8] mb-1 block flex items-center gap-0.5"><Droplet size={9} /> Fat</label>
                  <input type="number" value={newMeal.fat} onChange={(e) => setNewMeal({ ...newMeal, fat: e.target.value })} placeholder="g" className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-2 py-2 text-xs text-white text-center outline-none focus:border-[#38bdf8]/50 transition-all" />
                </div>
                {/* Carbs */}
                <div>
                  <label className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#2dd4bf] mb-1 block flex items-center gap-0.5"><Leaf size={9} /> Carbs</label>
                  <input type="number" value={newMeal.carbs} onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })} placeholder="g" className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-2 py-2 text-xs text-white text-center outline-none focus:border-[#2dd4bf]/50 transition-all" />
                </div>
                {/* Calories */}
                <div>
                  <label className={`text-[9px] font-semibold uppercase tracking-[0.1em] mb-1 block flex items-center gap-0.5 ${newCalTooLow ? "text-red-400" : "text-[#fb923c]"}`}>
                    <Flame size={9} /> Kcal
                  </label>
                  <input
                    type="number"
                    value={newMeal.calories}
                    onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                    placeholder={newMealMinCal > 0 ? String(newMealMinCal) : "kcal"}
                    className={`w-full rounded-xl bg-white/[0.04] border px-2 py-2 text-xs text-white text-center outline-none transition-all ${newCalTooLow ? "border-red-500/60 focus:border-red-400" : "border-white/10 focus:border-[#fb923c]/50"}`}
                  />
                </div>
              </div>

              {/* Macro calorie hint */}
              {newMealMinCal > 0 && (
                <p className={`text-[10px] ml-1 -mt-1 ${newCalTooLow ? "text-red-400" : "text-white/30"}`}>
                  {newCalTooLow
                    ? `⚠ Min calories from macros is ${newMealMinCal} kcal`
                    : `Macro-derived min: ${newMealMinCal} kcal · You can set higher`}
                </p>
              )}

              <div className="flex items-center justify-end pt-2 mt-1 border-t border-[#00d0ff]/10">
                <button 
                  onClick={() => { setAddingMeal(false); setNewMeal({ name: "", calories: "", protein: "", fat: "", carbs: "" }); }} 
                  className="px-4 py-2 rounded-xl font-bold text-xs text-white/50 hover:text-white hover:bg-white/5 transition-all mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMeal}
                  disabled={!newMeal.name.trim() || newCalTooLow}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold text-xs text-[#030818] bg-gradient-to-r from-[#00d0ff] to-[#3b82f6] shadow-[0_0_15px_rgba(0,208,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
                >
                  <Check size={14} strokeWidth={2.5} /> Save Meal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Meal List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-[#00d0ff]/20 scrollbar-track-transparent">
          {meals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-white/20">
              <Utensils size={28} strokeWidth={1.2} />
              <p className="text-sm">No meals logged today.</p>
            </div>
          ) : (
            meals.map(meal => {
              const isEditing = editingMealId === meal.id;
              const isExpanded = expandedMealId === meal.id;

              return (
                <div key={meal.id} className={`rounded-[16px] border bg-[#07112c]/60 overflow-hidden transition-all ${isEditing ? "border-[#00d0ff]/60 shadow-[0_0_20px_rgba(0,208,255,0.12)]" : "border-[#00d0ff]/20 hover:border-[#00d0ff]/40"}`}>

                  {/* Summary Row — always clickable to expand/collapse */}
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() => !isEditing && setExpandedMealId(isExpanded ? null : meal.id)}
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0a1535] border border-[#00d0ff]/20 shadow-inner">
                      <Flame size={18} className="text-[#fb923c] drop-shadow-[0_0_5px_rgba(251,146,60,0.5)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate tracking-wide">{meal.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] font-medium text-white/50">
                        <span className="text-[#fb923c] font-bold">{meal.calories} kcal</span>
                        <span>·</span>
                        <span className="text-[#00d0ff]">{meal.protein}P</span>
                        <span className="text-[#38bdf8]">{meal.fat}F</span>
                        <span className="text-[#2dd4bf]">{meal.carbs}C</span>
                      </div>
                    </div>
                    {/* Edit / Done / Expand buttons */}
                    <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                      {!isEditing && (
                        <>
                          <button
                            onClick={(e) => { startEdit(meal, e); setExpandedMealId(meal.id); }}
                            className="flex items-center justify-center h-7 w-7 rounded-lg bg-white/[0.04] border border-white/10 text-white/40 hover:text-[#00d0ff] hover:border-[#00d0ff]/40 hover:bg-[#00d0ff]/10 transition-all"
                            title="Edit meal"
                          >
                            <Pencil size={13} strokeWidth={1.8} />
                          </button>
                          <div className="text-[#00d0ff]/40">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded Panel — Read-only view OR Edit form */}
                  {isExpanded && (
                    <div className="p-4 pt-2 border-t border-white/5 bg-black/20">
                      {isEditing ? (
                        // ── EDIT MODE ──
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1 mb-1 block">Name</label>
                            <input
                              type="text"
                              value={editDraft.name}
                              onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[#00d0ff]/50 transition-all"
                            />
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <label className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#00d0ff] mb-1 block">Pro</label>
                              <input type="number" value={editDraft.protein}
                                onChange={(e) => setEditDraft({ ...editDraft, protein: e.target.value })}
                                className={`${editCell} focus:border-[#00d0ff]/50`} />
                            </div>
                            <div>
                              <label className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#38bdf8] mb-1 block">Fat</label>
                              <input type="number" value={editDraft.fat}
                                onChange={(e) => setEditDraft({ ...editDraft, fat: e.target.value })}
                                className={`${editCell} focus:border-[#38bdf8]/50`} />
                            </div>
                            <div>
                              <label className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#2dd4bf] mb-1 block">Carbs</label>
                              <input type="number" value={editDraft.carbs}
                                onChange={(e) => setEditDraft({ ...editDraft, carbs: e.target.value })}
                                className={`${editCell} focus:border-[#2dd4bf]/50`} />
                            </div>
                            <div>
                              <label className={`text-[9px] font-semibold uppercase tracking-[0.1em] mb-1 block ${draftCalTooLow ? "text-red-400" : "text-[#fb923c]"}`}>Kcal</label>
                              <input type="number" value={editDraft.calories}
                                onChange={(e) => setEditDraft({ ...editDraft, calories: e.target.value })}
                                className={`${editCell} ${draftCalTooLow ? "border-red-500/60 focus:border-red-400" : "border-white/10 focus:border-[#fb923c]/50"}`} />
                            </div>
                          </div>

                          {/* Hint */}
                          {draftMinCal > 0 && (
                            <p className={`text-[10px] ml-1 -mt-1 ${draftCalTooLow ? "text-red-400" : "text-white/30"}`}>
                              {draftCalTooLow
                                ? `⚠ Min calories from macros is ${draftMinCal} kcal`
                                : `Macro-derived min: ${draftMinCal} kcal · You can set higher`}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5">
                            <button
                              onClick={(e) => deleteMeal(meal.id, e)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all text-xs font-semibold"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={cancelEdit}
                                className="px-4 py-2 rounded-xl font-bold text-xs text-white/50 hover:text-white hover:bg-white/5 transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={saveEdit}
                                disabled={draftCalTooLow}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-[#030818] bg-gradient-to-r from-[#00d0ff] to-[#3b82f6] shadow-[0_0_15px_rgba(0,208,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
                              >
                                <Check size={14} strokeWidth={2.5} /> Save Changes
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // ── READ-ONLY VIEW ──
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25 ml-1 mb-1 block">Name</label>
                            <p className="px-3 py-2 text-sm text-white/80 bg-white/[0.02] rounded-xl border border-white/5">{meal.name}</p>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="text-center">
                              <label className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#00d0ff] mb-1 block">Pro</label>
                              <p className={`${readonlyCell} text-white/70`}>{meal.protein}g</p>
                            </div>
                            <div className="text-center">
                              <label className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#38bdf8] mb-1 block">Fat</label>
                              <p className={`${readonlyCell} text-white/70`}>{meal.fat}g</p>
                            </div>
                            <div className="text-center">
                              <label className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#2dd4bf] mb-1 block">Carbs</label>
                              <p className={`${readonlyCell} text-white/70`}>{meal.carbs}g</p>
                            </div>
                            <div className="text-center">
                              <label className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#fb923c] mb-1 block">Kcal</label>
                              <p className={`${readonlyCell} text-[#fb923c] font-bold`}>{meal.calories}</p>
                            </div>
                          </div>
                          <p className="text-[10px] text-white/20 ml-1">Tap the ✏ pencil icon to make edits.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
