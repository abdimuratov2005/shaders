import { EventDispatcher, TextureLoader, Texture } from 'three';
import { AssetInfo, AssetsToPreloadProps, LoadedAssetsProps } from '../types/Assets';

export class Preloader extends EventDispatcher {
  _assetsLoadedCounter: number;
  _cubeTextureLoader: TextureLoader;
  _assetsToPreload: AssetInfo[];
  loadedAssets: Record<string, LoadedAssetsProps>;
  progress: number;

  constructor() {
    super();
    this._assetsLoadedCounter = 0;
    this._cubeTextureLoader = new TextureLoader();
    this._assetsToPreload = null!;
    this.loadedAssets = {};
    this.progress = 0;
  }

  assignAsset(params: LoadedAssetsProps) {
    const { asset, naturalHeight, naturalWidth, objPropertyName, type } = params;
    
    this.loadedAssets[objPropertyName] = {
      objPropertyName,
      type,
      asset,
      naturalWidth,
      naturalHeight
    };
    
    this._onAssetLoaded();
  }

  _preloadTextures() {
    if (this._assetsToPreload.length === 0) {
      return this._onLoadingComplete();
    }

    const handleImageLoad = (assetInfo: AssetInfo) => {
      const texture = new Texture();
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = assetInfo.src;
      const assignImageAsset = () => {
        texture.image = image;
        texture.needsUpdate = true;
        this.assignAsset({
          objPropertyName: assetInfo.targetName,
          type: "image",
          asset: texture,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight
        });
      };

      if (image.complete) {
        return assignImageAsset();
      }

      image.onload = () => {
        assignImageAsset();
      };

      image.onerror = () => {
        this.assignAsset({
          objPropertyName: assetInfo.targetName || assetInfo.src,
          type: "image",
          asset: texture,
          naturalWidth: 1,
          naturalHeight: 1
        });
        console.error(`Failed to load image at ${assetInfo.src}`);
      };

    };

    this._assetsToPreload.forEach((assetInfoToPreload) => {
      handleImageLoad(assetInfoToPreload);
    });
  }

  _onAssetLoaded() {
    this._assetsLoadedCounter += 1;
    this.progress = this._assetsLoadedCounter / this._assetsToPreload.length;
    
    // @ts-ignore
    this.dispatchEvent({
      type: "progress",
    });

    this.progress === 1 && this._onLoadingComplete();
  }

  _onLoadingComplete() {
    // @ts-ignore
    this.dispatchEvent({
      type: "loaded"
    })
  }

  setAssetsToPreload(asset: AssetsToPreloadProps[]) {
    this._assetsToPreload = asset
    this._preloadTextures()
  }
}