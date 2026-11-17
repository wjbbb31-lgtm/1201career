export interface DeviceCapabilities {
  webglSupported: boolean;
  isSoftwareGl: boolean;
  isDesktopPC: boolean;
}

export function detectDeviceCapabilities(): DeviceCapabilities {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { webglSupported: true, isSoftwareGl: false, isDesktopPC: true };
  }

  let webglSupported = false;
  let isSoftwareGl = false;

  try {
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (gl) {
      webglSupported = true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param) || '');
      isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {
    webglSupported = false;
  }

  const ua = navigator.userAgent || '';
  const isMobileOrTabletUA =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Tablet/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const hasCoarsePointer =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches;

  const isSmallScreen = window.innerWidth < 900;

  // Enable shadows only on desktop PC (non-mobile/tablet, fine pointer, non-software GL)
  const isDesktopPC = !isMobileOrTabletUA && !hasCoarsePointer && !isSmallScreen;

  return {
    webglSupported,
    isSoftwareGl,
    isDesktopPC,
  };
}
