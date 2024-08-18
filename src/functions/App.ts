import { BoxGeometry, IUniform, Mesh, MeshBasicMaterial, PerspectiveCamera, Raycaster, Scene, ShaderMaterial, Texture, TextureLoader, Vector3, WebGLRenderer } from "three";
import { Preloader } from "./Preloader";
import { AssetsEvent, LoadedAssetsProps } from "../types/Assets";
import { assets, elRefs } from "../api/data";

const vertexShader = `
    varying vec2 vUv;

    void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform sampler2D uTexture;
    varying vec2 vUv;

    void main() {
        vec4 color = texture2D(uTexture, vUv);
        gl_FragColor = color;
    }
`;

export class App {
    private _canvas: HTMLCanvasElement = null!;
    private _scene: Scene = null!;
    private _renderer: WebGLRenderer = null!;
    private _camera: PerspectiveCamera = null!;

    private _uniforms: Record<string, IUniform<any>> = null!;
    private _raycaster: Raycaster = null!;
    private _preloader: Preloader = null!;
    private _mouse: {
        target: {
            x: number;
            y: number
        },
        click?: {
            x: number;
            y: number
        }
    } = null!;
    private _assetsSize: number = null!;

    constructor() {        
        this._createScene(() => {
            this._raycaster = new Raycaster();
            this._preloader = new Preloader();
            
            const assetsNormal = assets.textures.map(asset => ({
                targetName: "texture",
                src: asset.src,
                order: asset.order,
                type: asset.type
            }));
            this._addListener();
            this._renderOnFrame();
    
            this._preloader.setAssetsToPreload([...assetsNormal])
        })
    }

    private _onAssetsLoaded(event: AssetsEvent) {
        const loadedAssets = Object.entries(event.target.loadedAssets);
        elRefs.renderer.style.opacity = "1";
        this._assetsSize = loadedAssets.length;
        
        loadedAssets.forEach(([_key, asset]) => {
            const texture = (asset as LoadedAssetsProps).asset as Texture;
            this._renderer?.initTexture(texture)
            if (this._uniforms) {
                this._uniforms.uTexture.value = texture;
            }
        });

        let geometry, material, mesh;
        console.log("Assets size: " + this._assetsSize);
        
        for (let index = 0; index < this._assetsSize; index++) {
            geometry = new BoxGeometry(1);
            material = new MeshBasicMaterial({
                color: "red"
            });
            mesh = new Mesh(geometry, material)
            mesh.position.x += index;
        }
    }

    private _onPreloaderProgress(event: AssetsEvent) {
        elRefs.loading.progress.style.transform = `scaleX(${event.target.progress})`;

        if (event.target.progress === 1) {
          elRefs.loading.el.style.opacity = "0";
          elRefs.loading.progress.style.opacity = "0";
        }
    }

    private _createScene(_onComplete: () => void) {
        this._scene = new Scene();
        this._canvas = document.createElement("canvas");
        elRefs.renderer.appendChild(this._canvas);

        this._renderer = new WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
            canvas: this._canvas
        })
        this._camera = new PerspectiveCamera();
        this._camera.position.z = 5

        this._renderer.setSize(
            elRefs.renderer.offsetWidth,
            elRefs.renderer.offsetHeight
        );

        this._uniforms = {
            uMousePosition: {
                value: new Vector3(0, 0, 0)
            },
            uTexture: {
                value: null!
            },
            uTime: {
                value: 0.0
            }
        }

        this._mouse = {
            target: {
                x: 0,
                y: 0
            },
            click: {
                x: 0,
                y: 0
            }
        }

        if (this._renderer && this._scene && this._camera) {
            _onComplete();
        }
    }

    private _onMouseMove(event: MouseEvent) {
        const rect = elRefs.renderer.getBoundingClientRect();

        this._mouse = {
            target: {
                x: event.clientX,
                y: event.clientY
            }
        }

        const x = this._mouse.target.x - rect.left;
        const y = this._mouse.target.y - rect.top;

        this._mouse.target.x = (x / elRefs.renderer.offsetWidth) * 2 - 1;
        this._mouse.target.y = -(y / elRefs.renderer.offsetHeight) * 2 + 1;

        const raycast = this._performRaycast({
            x: this._mouse.target.x,
            y: this._mouse.target.y
        })
    }


    private _performRaycast(params: { x: number, y: number }) {
        const { x, y } = params;
        // @ts-ignore
        this._raycaster.setFromCamera({ x, y }, this._camera)

        const intersects = this._raycaster.intersectObjects(this._scene.children);

        return intersects
    }

    private _addListener() {
        elRefs.renderer.addEventListener("mousemove", this._onMouseMove.bind(this))
        this._preloader.addEventListener("progress", this._onPreloaderProgress);
        this._preloader.addEventListener("loaded", this._onAssetsLoaded);
    }

    private _renderOnFrame() {

        this._camera.position.lerp(
            new Vector3(
                -this._mouse.target.x * 2,
                -this._mouse.target.y * 2,
                this._camera.position.z,
            ),
            0.05
        )

        this._uniforms.uTime.value += 0.01;

        this._renderer.render(this._scene, this._camera);
        window.requestAnimationFrame(this._renderOnFrame.bind(this))
    }
}
