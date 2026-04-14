import { Label } from '@/components/ui/Label';

interface Props {
  message: string;
  timestamp?: string;
  recipientName?: string;
  senderName?: string;
  framed?: boolean;
}

/**
 * The one place in the UI where we break the editorial aesthetic.
 * This has to read as a photographically real WhatsApp message for
 * demo credibility — so inside the bubble we use WhatsApp's own
 * colors and system font. The editorial frame around it is what
 * makes the contrast meaningful: "this is the product's output".
 */
export function MessagePreview({
  message,
  timestamp = 'ahora',
  recipientName = 'Sofía Benítez',
  senderName = 'Fabric Sushi',
  framed = true,
}: Props) {
  const bubble = (
    <div
      className="w-full max-w-[380px] mx-auto overflow-hidden"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        background: '#0B141A',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ background: '#202C33' }}
      >
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
          style={{ background: '#00A884' }}
        >
          {senderName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-[14px] font-medium leading-tight truncate">
            {recipientName}
          </div>
          <div className="text-[11px] leading-tight" style={{ color: '#8696A0' }}>
            en línea
          </div>
        </div>
      </div>

      {/* Chat background */}
      <div
        className="px-4 py-8 min-h-[220px] relative"
        style={{
          background:
            "#0B141A url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23182229' fill-opacity='0.25' width='40' height='40'/%3E%3C/svg%3E\") repeat",
        }}
      >
        <div className="flex justify-end">
          <div
            className="relative max-w-[80%] rounded-lg px-3 py-2 text-[14px] leading-snug text-white shadow-sm"
            style={{ background: '#005C4B' }}
          >
            <p className="whitespace-pre-wrap break-words">{message}</p>
            <div className="flex items-center justify-end gap-1 mt-1 -mb-1">
              <span className="text-[10px]" style={{ color: '#94BDA8' }}>
                {timestamp}
              </span>
              {/* Double tick */}
              <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                <path
                  d="M11.071 0.653L5.232 6.492L3.146 4.406L2.439 5.113L5.232 7.906L11.778 1.36L11.071 0.653Z"
                  fill="#53BDEB"
                />
                <path
                  d="M14.071 0.653L8.232 6.492L7.525 5.785L6.818 6.492L8.232 7.906L14.778 1.36L14.071 0.653Z"
                  fill="#53BDEB"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!framed) return bubble;

  return (
    <div className="border border-hairline p-6 bg-bg-raised">
      <div className="flex items-center justify-between mb-4">
        <Label>Preview · WhatsApp</Label>
        <Label className="text-accent">Listo para enviar</Label>
      </div>
      {bubble}
    </div>
  );
}
