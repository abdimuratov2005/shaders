import { Texture } from "three";
import { Preloader } from "../functions/Preloader";

export type AssetsToPreloadProps = {
  type: string;
};

export type LoadedAssetsProps = {
  asset: Texture;
  type: string;
  objPropertyName: number | string;
  naturalWidth: number;
  naturalHeight: number;
};

export type AssetInfo = {
  src: string;
  targetName: string;
};

export type AssetsEvent = {
    target: Preloader
}