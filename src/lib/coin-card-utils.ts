
export const pastelGradients = [
  "linear-gradient(135deg, #FFB6C1 0%, #FFE4E1 100%)",
  "linear-gradient(135deg, #E6E6FA 0%, #F0F8FF 100%)",
  "linear-gradient(135deg, #DDA0DD 0%, #E6E6FA 100%)",
  "linear-gradient(135deg, #B0E0E6 0%, #F0FFFF 100%)",
  "linear-gradient(135deg, #98FB98 0%, #F0FFF0 100%)",
  "linear-gradient(135deg, #DEB887 0%, #FFE4B5 100%)",
  "linear-gradient(135deg, #F08080 0%, #FFE4E1 100%)",
  "linear-gradient(135deg, #87CEEB 0%, #F0F8FF 100%)",
];

export const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return `$${(volume / 1000000).toFixed(1)}M`;
  }
  if (volume >= 1000) {
    return `$${(volume / 1000).toFixed(1)}K`;
  }
  return `$${volume.toFixed(2)}`;
};

export const getRankDisplay = (rank: number): string => {
  return `#${rank}`;
};
