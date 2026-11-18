import * as React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export function ArrowClockwiseDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M216 128a88 88 0 1 1-88-88a88 88 0 0 1 88 88" opacity=".2" />
        <path fill="currentColor" d="M240 56v48a8 8 0 0 1-8 8h-48a8 8 0 0 1 0-16h27.4l-26.59-24.36l-.25-.24a80 80 0 1 0-1.67 114.78a8 8 0 0 1 11 11.63A95.44 95.44 0 0 1 128 224h-1.32a96 96 0 1 1 69.07-164L224 85.8V56a8 8 0 1 1 16 0" />
      </g>
    </svg>
  );
}

export function ArrowLeftDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M112 56v144l-72-72Z" opacity=".2" />
        <path fill="currentColor" d="M216 120h-96V56a8 8 0 0 0-13.66-5.66l-72 72a8 8 0 0 0 0 11.32l72 72A8 8 0 0 0 120 200v-64h96a8 8 0 0 0 0-16m-112 60.69L51.31 128L104 75.31Z" />
      </g>
    </svg>
  );
}

export function ArrowRightDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="m216 128l-72 72V56Z" opacity=".2" />
        <path fill="currentColor" d="m221.66 122.34l-72-72A8 8 0 0 0 136 56v64H40a8 8 0 0 0 0 16h96v64a8 8 0 0 0 13.66 5.66l72-72a8 8 0 0 0 0-11.32M152 180.69V75.31L204.69 128Z" />
      </g>
    </svg>
  );
}

export function CalendarBlankDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M216 48v40H40V48a8 8 0 0 1 8-8h160a8 8 0 0 1 8 8" opacity=".2" />
        <path fill="currentColor" d="M208 32h-24v-8a8 8 0 0 0-16 0v8H88v-8a8 8 0 0 0-16 0v8H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16M72 48v8a8 8 0 0 0 16 0v-8h80v8a8 8 0 0 0 16 0v-8h24v32H48V48Zm136 160H48V96h160z" />
      </g>
    </svg>
  );
}

export function CheckCircleDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M224 128a96 96 0 1 1-96-96a96 96 0 0 1 96 96" opacity=".2" />
        <path fill="currentColor" d="M173.66 98.34a8 8 0 0 1 0 11.32l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 0M232 128A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104m-16 0a88 88 0 1 0-88 88a88.1 88.1 0 0 0 88-88" />
      </g>
    </svg>
  );
}

export function CircleHalfDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M224 128a96 96 0 0 1-96 96V32a96 96 0 0 1 96 96" opacity=".2" />
        <path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24M40 128a88.11 88.11 0 0 1 80-87.63v175.26A88.11 88.11 0 0 1 40 128m96 87.63V40.37a88 88 0 0 1 0 175.26" />
      </g>
    </svg>
  );
}

export function ClockDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M224 128a96 96 0 1 1-96-96a96 96 0 0 1 96 96" opacity=".2" />
        <path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m64-88a8 8 0 0 1-8 8h-56a8 8 0 0 1-8-8V72a8 8 0 0 1 16 0v48h48a8 8 0 0 1 8 8" />
      </g>
    </svg>
  );
}

export function CopyDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M216 40v128h-48V88H88V40Z" opacity=".2" />
        <path fill="currentColor" d="M216 32H88a8 8 0 0 0-8 8v40H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-40h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8m-56 176H48V96h112Zm48-48h-32V88a8 8 0 0 0-8-8H96V48h112Z" />
      </g>
    </svg>
  );
}

export function DotsThreeDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M240 96v64a16 16 0 0 1-16 16H32a16 16 0 0 1-16-16V96a16 16 0 0 1 16-16h192a16 16 0 0 1 16 16" opacity=".2" />
        <path fill="currentColor" d="M140 128a12 12 0 1 1-12-12a12 12 0 0 1 12 12m56-12a12 12 0 1 0 12 12a12 12 0 0 0-12-12m-136 0a12 12 0 1 0 12 12a12 12 0 0 0-12-12" />
      </g>
    </svg>
  );
}

export function FileTextDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M208 88h-56V32Z" opacity=".2" />
        <path fill="currentColor" d="m213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66M160 51.31L188.69 80H160ZM200 216H56V40h88v48a8 8 0 0 0 8 8h48zm-32-80a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8m0 32a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8" />
      </g>
    </svg>
  );
}

export function FunnelDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M221.9 61.38L152 136v58.65a8 8 0 0 1-3.56 6.66l-32 21.33A8 8 0 0 1 104 216v-80L34.1 61.38A8 8 0 0 1 40 48h176a8 8 0 0 1 5.9 13.38" opacity=".2" />
        <path fill="currentColor" d="M230.6 49.53A15.81 15.81 0 0 0 216 40H40a16 16 0 0 0-11.81 26.76l.08.09L96 139.17V216a16 16 0 0 0 24.87 13.32l32-21.34a16 16 0 0 0 7.13-13.32v-55.49l67.74-72.32l.08-.09a15.8 15.8 0 0 0 2.78-17.23m-84.42 81.05A8 8 0 0 0 144 136v58.66L112 216v-80a8 8 0 0 0-2.16-5.47L40 56h176Z" />
      </g>
    </svg>
  );
}

export function HouseDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M216 120v96h-64v-64h-48v64H40v-96a8 8 0 0 1 2.34-5.66l80-80a8 8 0 0 1 11.32 0l80 80A8 8 0 0 1 216 120" opacity=".2" />
        <path fill="currentColor" d="m219.31 108.68l-80-80a16 16 0 0 0-22.62 0l-80 80A15.87 15.87 0 0 0 32 120v96a8 8 0 0 0 8 8h64a8 8 0 0 0 8-8v-56h32v56a8 8 0 0 0 8 8h64a8 8 0 0 0 8-8v-96a15.87 15.87 0 0 0-4.69-11.32M208 208h-48v-56a8 8 0 0 0-8-8h-48a8 8 0 0 0-8 8v56H48v-88l80-80l80 80Z" />
      </g>
    </svg>
  );
}

export function ImageDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M224 56v122.06l-39.72-39.72a8 8 0 0 0-11.31 0L147.31 164l-49.65-49.66a8 8 0 0 0-11.32 0L32 168.69V56a8 8 0 0 1 8-8h176a8 8 0 0 1 8 8" opacity=".2" />
        <path fill="currentColor" d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m0 16v102.75l-26.07-26.06a16 16 0 0 0-22.63 0l-20 20l-44-44a16 16 0 0 0-22.62 0L40 149.37V56ZM40 172l52-52l80 80H40Zm176 28h-21.37l-36-36l20-20L216 181.38zm-72-100a12 12 0 1 1 12 12a12 12 0 0 1-12-12" />
      </g>
    </svg>
  );
}

export function ListDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M216 64v128H40V64Z" opacity=".2" />
        <path fill="currentColor" d="M224 128a8 8 0 0 1-8 8H40a8 8 0 0 1 0-16h176a8 8 0 0 1 8 8M40 72h176a8 8 0 0 0 0-16H40a8 8 0 0 0 0 16m176 112H40a8 8 0 0 0 0 16h176a8 8 0 0 0 0-16" />
      </g>
    </svg>
  );
}

export function MagnifyingGlassDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M192 112a80 80 0 1 1-80-80a80 80 0 0 1 80 80" opacity=".2" />
        <path fill="currentColor" d="m229.66 218.34l-50.06-50.06a88.21 88.21 0 1 0-11.32 11.31l50.06 50.07a8 8 0 0 0 11.32-11.32M40 112a72 72 0 1 1 72 72a72.08 72.08 0 0 1-72-72" />
      </g>
    </svg>
  );
}

export function PrinterDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M232 96v80h-40v-24H64v24H24V96c0-8.84 7.76-16 17.33-16h173.34c9.57 0 17.33 7.16 17.33 16" opacity=".2" />
        <path fill="currentColor" d="M214.67 72H200V40a8 8 0 0 0-8-8H64a8 8 0 0 0-8 8v32H41.33C27.36 72 16 82.77 16 96v80a8 8 0 0 0 8 8h32v32a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-32h32a8 8 0 0 0 8-8V96c0-13.23-11.36-24-25.33-24M72 48h112v24H72Zm112 160H72v-48h112Zm40-40h-24v-16a8 8 0 0 0-8-8H64a8 8 0 0 0-8 8v16H32V96c0-4.41 4.19-8 9.33-8h173.34c5.14 0 9.33 3.59 9.33 8Zm-24-52a12 12 0 1 1-12-12a12 12 0 0 1 12 12" />
      </g>
    </svg>
  );
}

export function QrCodeDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M112 56v48a8 8 0 0 1-8 8H56a8 8 0 0 1-8-8V56a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8m-8 88H56a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h48a8 8 0 0 0 8-8v-48a8 8 0 0 0-8-8m96-96h-48a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h48a8 8 0 0 0 8-8V56a8 8 0 0 0-8-8" opacity=".2" />
        <path fill="currentColor" d="M104 40H56a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m0 64H56V56h48zm0 32H56a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16v-48a16 16 0 0 0-16-16m0 64H56v-48h48zm96-160h-48a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m0 64h-48V56h48zm-64 72v-32a8 8 0 0 1 16 0v32a8 8 0 0 1-16 0m80-16a8 8 0 0 1-8 8h-24v40a8 8 0 0 1-8 8h-32a8 8 0 0 1 0-16h24v-56a8 8 0 0 1 16 0v8h24a8 8 0 0 1 8 8m0 32v16a8 8 0 0 1-16 0v-16a8 8 0 0 1 16 0" />
      </g>
    </svg>
  );
}

export function ReceiptDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M224 56v152l-32-16l-32 16l-32-16l-32 16l-32-16l-32 16V56a8 8 0 0 1 8-8h176a8 8 0 0 1 8 8" opacity=".2" />
        <path fill="currentColor" d="M72 104a8 8 0 0 1 8-8h96a8 8 0 0 1 0 16H80a8 8 0 0 1-8-8m8 40h96a8 8 0 0 0 0-16H80a8 8 0 0 0 0 16m152-88v152a8 8 0 0 1-11.58 7.15L192 200.94l-28.42 14.21a8 8 0 0 1-7.16 0L128 200.94l-28.42 14.21a8 8 0 0 1-7.16 0L64 200.94l-28.42 14.21A8 8 0 0 1 24 208V56a16 16 0 0 1 16-16h176a16 16 0 0 1 16 16m-16 0H40v139.06l20.42-10.22a8 8 0 0 1 7.16 0L96 199.06l28.42-14.22a8 8 0 0 1 7.16 0L160 199.06l28.42-14.22a8 8 0 0 1 7.16 0L216 195.06Z" />
      </g>
    </svg>
  );
}

export function SignOutDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M224 56v144a16 16 0 0 1-16 16H48V40h160a16 16 0 0 1 16 16" opacity=".2" />
        <path fill="currentColor" d="M120 216a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8V40a8 8 0 0 1 8-8h64a8 8 0 0 1 0 16H56v160h56a8 8 0 0 1 8 8m109.66-93.66l-40-40a8 8 0 0 0-11.32 11.32L204.69 120H112a8 8 0 0 0 0 16h92.69l-26.35 26.34a8 8 0 0 0 11.32 11.32l40-40a8 8 0 0 0 0-11.32" />
      </g>
    </svg>
  );
}

export function UploadSimpleDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M216 48v160H40V48a16 16 0 0 1 16-16h144a16 16 0 0 1 16 16" opacity=".2" />
        <path fill="currentColor" d="M224 144v64a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8v-64a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0M93.66 77.66L120 51.31V144a8 8 0 0 0 16 0V51.31l26.34 26.35a8 8 0 0 0 11.32-11.32l-40-40a8 8 0 0 0-11.32 0l-40 40a8 8 0 0 0 11.32 11.32" />
      </g>
    </svg>
  );
}

export function UserCircleDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M224 128a95.76 95.76 0 0 1-31.8 71.37A72 72 0 0 0 128 160a40 40 0 1 0-40-40a40 40 0 0 0 40 40a72 72 0 0 0-64.2 39.37A96 96 0 1 1 224 128" opacity=".2" />
        <path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24M74.08 197.5a64 64 0 0 1 107.84 0a87.83 87.83 0 0 1-107.84 0M96 120a32 32 0 1 1 32 32a32 32 0 0 1-32-32m97.76 66.41a79.66 79.66 0 0 0-36.06-28.75a48 48 0 1 0-59.4 0a79.66 79.66 0 0 0-36.06 28.75a88 88 0 1 1 131.52 0" />
      </g>
    </svg>
  );
}

export function WarningCircleDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M224 128a96 96 0 1 1-96-96a96 96 0 0 1 96 96" opacity=".2" />
        <path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m-8-80V80a8 8 0 0 1 16 0v56a8 8 0 0 1-16 0m20 36a12 12 0 1 1-12-12a12 12 0 0 1 12 12" />
      </g>
    </svg>
  );
}

export function XCircleDuotone({ size = 20, className, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} {...props}>
      <g fill="currentColor">
        <path fill="currentColor" d="M224 128a96 96 0 1 1-96-96a96 96 0 0 1 96 96" opacity=".2" />
        <path fill="currentColor" d="M165.66 101.66L139.31 128l26.35 26.34a8 8 0 0 1-11.32 11.32L128 139.31l-26.34 26.35a8 8 0 0 1-11.32-11.32L116.69 128l-26.35-26.34a8 8 0 0 1 11.32-11.32L128 116.69l26.34-26.35a8 8 0 0 1 11.32 11.32M232 128A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104m-16 0a88 88 0 1 0-88 88a88.1 88.1 0 0 0 88-88" />
      </g>
    </svg>
  );
}
