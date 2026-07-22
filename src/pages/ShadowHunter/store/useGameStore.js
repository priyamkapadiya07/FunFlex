import { create } from 'zustand';

export const useGameStore = create((set) => ({
  health: 100,
  maxHealth: 100,
  battery: 100,
  maxBattery: 100,
  isFlashlightOn: true,
  isSprinting: false,
  equippedWeapon: 'pistol',
  ammo: {
    pistol: 60,
    shotgun: 0,
    smg: 0,
    assault_rifle: 0,
    energy_rifle: 0
  },
  unlockedWeapons: ['pistol'],
  difficulty: 'normal',
  score: 0,
  gameWon: false,
  gameOver: false,
  
  // Mobile Input State
  mobileMove: { x: 0, y: 0 },
  mobileLook: { x: 0, y: 0 },
  mobileJump: false,
  mobileShoot: false,
  
  // Objectives
  objectives: [
    { id: '1', text: 'Find the Generator', completed: false },
    { id: '2', text: 'Survive the Darkness', completed: false }
  ],
  
  // Actions
  toggleFlashlight: () => set((state) => ({ isFlashlightOn: !state.isFlashlightOn && state.battery > 0 })),
  setSprinting: (isSprinting) => set({ isSprinting }),
  drainBattery: (amount) => set((state) => {
    const newBattery = Math.max(0, state.battery - amount);
    return { 
      battery: newBattery,
      isFlashlightOn: newBattery > 0 ? state.isFlashlightOn : false
    };
  }),
  rechargeBattery: (amount) => set((state) => ({ battery: Math.min(state.maxBattery, state.battery + amount) })),
  takeDamage: (amount) => set((state) => ({ health: Math.max(0, state.health - amount) })),
  heal: (amount) => set((state) => ({ health: Math.min(state.maxHealth, state.health + amount) })),
  equipWeapon: (weaponId) => set((state) => {
    if (state.unlockedWeapons.includes(weaponId)) {
      return { equippedWeapon: weaponId };
    }
    return {};
  }),
  addAmmo: (weaponId, amount) => set((state) => ({
    ammo: {
      ...state.ammo,
      [weaponId]: state.ammo[weaponId] + amount
    }
  })),
  unlockWeapon: (weaponId) => set((state) => ({
    unlockedWeapons: [...new Set([...state.unlockedWeapons, weaponId])]
  })),
  setMobileMove: (move) => set({ mobileMove: move }),
  setMobileLook: (look) => set({ mobileLook: look }),
  setMobileJump: (val) => set({ mobileJump: val }),
  setMobileShoot: (val) => set({ mobileShoot: val }),
  completeObjective: (id) => set((state) => ({
    objectives: state.objectives.map(obj => obj.id === id ? { ...obj, completed: true } : obj)
  })),
  setGameWon: (val) => set({ gameWon: val }),
  setGameOver: (val) => set({ gameOver: val }),
  resetGame: () => set({ 
    health: 100, 
    gameOver: false, 
    gameWon: false,
    objectives: [
      { id: '1', text: 'Find the Generator', completed: false },
      { id: '2', text: 'Survive the Darkness', completed: false }
    ]
  }),
  takeDamage: (amount) => set((state) => {
    const newHealth = Math.max(0, state.health - amount);
    if (newHealth === 0 && !state.gameWon) {
      return { health: 0, gameOver: true };
    }
    return { health: newHealth };
  }),
}));
