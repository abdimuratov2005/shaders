export const assets = {
    textures: [
        {
            order: 0,
            src: "/img.jpg",
            type: "image",
            targetName: ""
        },
        {
            order: 1,
            src: "/img1.jpg",
            type: "image",
            targetName: ""
        },
        {
            order: 2,
            src: "/img2.jpg",
            type: "image",
            targetName: ""
        },
        {
            order: 3,
            src: "/img3.jpg",
            type: "image",
            targetName: ""
        },
    ]
};

type ElRefs = {
    renderer: HTMLDivElement;
    loading: {
        el: HTMLDivElement;
        progress: HTMLDivElement
    };
}

export const elRefs: ElRefs = {
    renderer: null!,
    loading: {
        el: null!,
        progress: null!
    }
}