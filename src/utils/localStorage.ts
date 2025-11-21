// localStorage utilities for CrePic

const RECENT_TOOLS_KEY = 'crepic_recentTools';
const FAVORITE_TOOLS_KEY = 'crepic_favoriteTools';
const MAX_RECENT_TOOLS = 10;

export function getRecentTools(): string[] {
  try {
    const data = localStorage.getItem(RECENT_TOOLS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addRecentTool(toolId: string): void {
  try {
    let recent = getRecentTools();
    // Remove if already exists
    recent = recent.filter(id => id !== toolId);
    // Add to front
    recent.unshift(toolId);
    // Keep max 10
    if (recent.length > MAX_RECENT_TOOLS) {
      recent = recent.slice(0, MAX_RECENT_TOOLS);
    }
    localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(recent));
  } catch (error) {
    console.error('Failed to save recent tool:', error);
  }
}

export function getFavoriteTools(): string[] {
  try {
    const data = localStorage.getItem(FAVORITE_TOOLS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteTool(toolId: string): boolean {
  try {
    let favorites = getFavoriteTools();
    const isFavorite = favorites.includes(toolId);
    
    if (isFavorite) {
      favorites = favorites.filter(id => id !== toolId);
    } else {
      favorites.push(toolId);
    }
    
    localStorage.setItem(FAVORITE_TOOLS_KEY, JSON.stringify(favorites));
    return !isFavorite;
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    return false;
  }
}

export function isFavoriteTool(toolId: string): boolean {
  return getFavoriteTools().includes(toolId);
}
