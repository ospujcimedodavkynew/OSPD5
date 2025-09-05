import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

export interface SignaturePadRef {
  getSignature: () => string | undefined;
  clearSignature: () => void;
}

const SignaturePad = forwardRef<SignaturePadRef, {}>((_, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = '#F9FAFB';
                ctx.lineWidth = 2;
            }
        }
    }, []);

    const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        isDrawing.current = true;
        const { offsetX, offsetY } = getCoords(event);
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
    };

    const draw = (event: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const { offsetX, offsetY } = getCoords(event);
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        isDrawing.current = false;
    };
    
    const getCoords = (event: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { offsetX: 0, offsetY: 0 };
        const rect = canvas.getBoundingClientRect();
        if ('touches' in event.nativeEvent) {
             return {
                offsetX: event.nativeEvent.touches[0].clientX - rect.left,
                offsetY: event.nativeEvent.touches[0].clientY - rect.top
            };
        }
        return {
            offsetX: event.nativeEvent.offsetX,
            offsetY: event.nativeEvent.offsetY
        };
    };

    useImperativeHandle(ref, () => ({
        getSignature: () => canvasRef.current?.toDataURL(),
        clearSignature: () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx?.clearRect(0, 0, canvas.width, canvas.height);
            }
        },
    }));

    return (
        <canvas
            ref={canvasRef}
            width="400"
            height="150"
            className="border border-gray-600 rounded-lg bg-gray-800 touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
        />
    );
});

export default SignaturePad;
