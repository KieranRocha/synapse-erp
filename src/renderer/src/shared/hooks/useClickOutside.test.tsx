import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { useClickOutside } from './useClickOutside';

describe('useClickOutside', () => {
  it('should call handler when clicking outside the element', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useClickOutside([ref], handler);
      return ref;
    });

    // Mock DOM element
    const element = document.createElement('div');
    const outsideElement = document.createElement('div');
    document.body.appendChild(element);
    document.body.appendChild(outsideElement);
    
    // Assign the element to the ref
    Object.defineProperty(result.current, 'current', {
      value: element,
      writable: true,
    });

    // Simulate click outside
    const event = new MouseEvent('mousedown', {
      bubbles: true,
    });
    Object.defineProperty(event, 'target', {
      value: outsideElement,
      enumerable: true,
    });

    document.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);

    // Cleanup
    document.body.removeChild(element);
    document.body.removeChild(outsideElement);
  });

  it('should not call handler when clicking inside the element', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useClickOutside([ref], handler);
      return ref;
    });

    const element = document.createElement('div');
    const childElement = document.createElement('span');
    element.appendChild(childElement);
    document.body.appendChild(element);
    
    Object.defineProperty(result.current, 'current', {
      value: element,
      writable: true,
    });

    // Simulate click inside (on child)
    const event = new MouseEvent('mousedown', {
      bubbles: true,
    });
    Object.defineProperty(event, 'target', {
      value: childElement,
      enumerable: true,
    });

    document.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(element);
  });

  it('should work with multiple refs', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => {
      const ref1 = useRef<HTMLDivElement>(null);
      const ref2 = useRef<HTMLDivElement>(null);
      useClickOutside([ref1, ref2], handler);
      return { ref1, ref2 };
    });

    const element1 = document.createElement('div');
    const element2 = document.createElement('div');
    const outsideElement = document.createElement('div');
    
    document.body.appendChild(element1);
    document.body.appendChild(element2);
    document.body.appendChild(outsideElement);
    
    Object.defineProperty(result.current.ref1, 'current', {
      value: element1,
      writable: true,
    });
    Object.defineProperty(result.current.ref2, 'current', {
      value: element2,
      writable: true,
    });

    // Click inside element1 - should not call handler
    let event = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(event, 'target', {
      value: element1,
      enumerable: true,
    });
    document.dispatchEvent(event);
    expect(handler).not.toHaveBeenCalled();

    // Click inside element2 - should not call handler
    event = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(event, 'target', {
      value: element2,
      enumerable: true,
    });
    document.dispatchEvent(event);
    expect(handler).not.toHaveBeenCalled();

    // Click outside both - should call handler
    event = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(event, 'target', {
      value: outsideElement,
      enumerable: true,
    });
    document.dispatchEvent(event);
    expect(handler).toHaveBeenCalledTimes(1);

    // Cleanup
    document.body.removeChild(element1);
    document.body.removeChild(element2);
    document.body.removeChild(outsideElement);
  });
});