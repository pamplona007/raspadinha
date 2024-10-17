import { useRef, useState, useEffect, useCallback, PropsWithChildren, forwardRef, useImperativeHandle, ForwardedRef } from 'react';

type Point = {
	x: number
	y: number
}

type CustomBrush = {
	image: string
	width: number
	height: number
}

type CustomCheckZone = {
	x: number,
	y: number,
	width: number,
	height: number
}

interface Props {
	width: number
	height: number
	image: string
	quality?: number
	finishPercent?: number
	onComplete?: () => void
	brushSize?: number
	fadeOutOnComplete?: boolean
	customBrush?: CustomBrush
	customCheckZone?: CustomCheckZone
}

export type ScratchCardRef = {
    getFilledInPixels: () => number
    reset: () => void
}

const ScratchCard = (props: PropsWithChildren<Props>, ref: ForwardedRef<ScratchCardRef>) => {
    const {
        finishPercent = 70,
        quality = 1,
        image: imageSrc,
        width,
        height,
        onComplete,
        brushSize,
        fadeOutOnComplete,
        children,
        customBrush,
        customCheckZone,
    } = props;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPoint, setLastPoint] = useState<Point | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [brushImage, setBrushImage] = useState<HTMLImageElement | null>(null);
    const canvasWidth = width * quality;
    const canvasHeight = height * quality;

    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            setIsLoaded(true);
        };
        img.src = imageSrc;
        setImage(img);

        if (customBrush) {
            const brushImg = new Image(customBrush.width, customBrush.height);
            brushImg.crossOrigin = 'Anonymous';
            brushImg.src = customBrush.image;
            setBrushImage(brushImg);
        }
    }, [imageSrc, customBrush]);

    useEffect(() => {
        if (canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                setCtx(context);
                if (image) {
                    context.drawImage(image, 0, 0, canvasWidth, canvasHeight);
                }
            }
        }
    }, [isLoaded, image, canvasWidth, canvasHeight]);

    const getMouse = useCallback((e: any, canvas: HTMLCanvasElement) => {
        const { top, left } = canvas.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        let x = 0;
        let y = 0;

        if (e && e.pageX && e.pageY) {
            x = e.pageX - left - scrollLeft;
            y = e.pageY - top - scrollTop;
        } else if (e && e.touches) {
            x = e.touches[0].clientX - left - scrollLeft;
            y = e.touches[0].clientY - top - scrollTop;
        }

        x = x * quality;
        y = y * quality;

        return { x, y };
    }, [quality]);

    const distanceBetween = useCallback((point1: Point | null, point2: Point | null) => {
        if (point1 && point2) {
            return Math.sqrt(
                (point2.x - point1.x)**2 + (point2.y - point1.y)**2,
            );
        }
        return 0;
    }, []);

    const angleBetween = useCallback((point1: Point | null, point2: Point | null) => {
        if (point1 && point2) {
            return Math.atan2(point2.x - point1.x, point2.y - point1.y);
        }
        return 0;
    }, []);

    const getFilledInPixels = useCallback((stride: number) => {
        if (!stride || 1 > stride) {
            stride = 1;
        }

        let x = 0;
        let y = 0;
        let width = canvasRef.current?.width || 0;
        let height = canvasRef.current?.height || 0;

        if (customCheckZone) {
            x = customCheckZone.x;
            y = customCheckZone.y;
            width = customCheckZone.width;
            height = customCheckZone.height;
        }

        const pixels = ctx?.getImageData(x, y, width, height);
        const total = (pixels?.data.length || 0) / stride || 0;
        let count = 0;

        for (let i = 0; i < (pixels?.data.length || 0); i += stride) {
            if (pixels && 0 === parseInt(pixels.data[i].toString(), 10)) {
                count++;
            }
        }

        return Math.round((count / total) * 100);
    }, [ctx, customCheckZone]);

    const handlePercentage = useCallback((filledInPixels = 0) => {
        if (isFinished) {
            return;
        }

        if (filledInPixels > finishPercent) {
            if (false !== fadeOutOnComplete) {
                if (canvasRef.current) {
                    canvasRef.current.style.transition = '1s';
                    canvasRef.current.style.opacity = '0';
                }
            }

            setIsFinished(true);
            if (onComplete) {
                onComplete();
            }
        }
    }, [fadeOutOnComplete, finishPercent, isFinished, onComplete]);

    const handleMouseDown = useCallback((e: any) => {
        setIsDrawing(true);
        setLastPoint(getMouse(e, canvasRef.current!));
    }, [getMouse]);

    const handleMouseMove = useCallback((e: any) => {
        if (!isDrawing) {
            return;
        }

        const currentPoint = getMouse(e, canvasRef.current!);
        const distance = distanceBetween(lastPoint, currentPoint);
        const angle = angleBetween(lastPoint, currentPoint);

        let x, y;

        for (let i = 0; i < distance; i++) {
            x = lastPoint ? lastPoint.x + Math.sin(angle) * i : 0;
            y = lastPoint ? lastPoint.y + Math.cos(angle) * i : 0;
            if (ctx) {
                ctx.globalCompositeOperation = 'destination-out';

                if (brushImage && customBrush) {
                    ctx.drawImage(
                        brushImage,
                        x,
                        y,
                        customBrush.width,
                        customBrush.height,
                    );
                } else {
                    ctx.beginPath();
                    ctx.arc(x, y, brushSize || 20, 0, 2 * Math.PI, false);
                    ctx.fill();
                }
            }
        }

        setLastPoint(currentPoint);
        handlePercentage(getFilledInPixels(32));
    }, [isDrawing, getMouse, distanceBetween, angleBetween, lastPoint, ctx, brushImage, customBrush, brushSize, handlePercentage, getFilledInPixels]);

    const handleMouseUp = useCallback(() => {
        setIsDrawing(false);
    }, []);

    const containerStyle = {
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative' as const,
        WebkitUserSelect: 'none' as const,
        MozUserSelect: 'none' as const,
        msUserSelect: 'none' as const,
        userSelect: 'none' as const,
    };

    const canvasStyle = {
        position: 'absolute' as const,
        top: 0,
        zIndex: 1,
    };

    const resultStyle = {
        visibility: isLoaded ? ('visible' as const) : ('hidden' as const),
        width: '100%',
        height: '100%',
    };

    useImperativeHandle(ref, () => ({
        getFilledInPixels: () => getFilledInPixels(32),
        reset: () => {
            if (ctx && image) {
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                ctx.globalCompositeOperation = 'source-over';
                ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
                setIsFinished(false);
                setLastPoint(null);
                setIsDrawing(false);
                if (canvasRef.current) {
                    canvasRef.current.style.transition = '0s';
                    canvasRef.current.style.opacity = '1';
                }
            }
        },
    }), [canvasHeight, canvasWidth, ctx, getFilledInPixels, image]);

    return (
        <div className={'ScratchCard__Container'} style={containerStyle}>
            {isLoaded &&
                <canvas
                    ref={canvasRef}
                    className={'ScratchCard__Canvas'}
                    style={{ ...canvasStyle, width: width, height: height }}
                    width={canvasWidth}
                    height={canvasHeight}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onTouchMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onTouchEnd={handleMouseUp}
                />
            }

            <div className={'ScratchCard__Result'} style={resultStyle}>
                {children}
            </div>
        </div>
    );
};

export default forwardRef(ScratchCard);
