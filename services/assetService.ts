// Placeholder for asset fetching
export const fetchAssetsForScene = async (sceneId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        message: 'Assets generated',
        sceneId
      });
    }, 1000);
  });
};
