import logo from '../../imports/keurope-logo.svg';

export function LogoPreview() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full p-8 space-y-8">
        <div className="bg-white p-12 rounded-lg shadow-sm border">
          <h2 className="text-lg mb-8 text-gray-600">Logo Preview - White Background</h2>
          <img src={logo} alt="keurope logo" className="h-16 w-auto" />
        </div>

        <div className="bg-black p-12 rounded-lg shadow-sm">
          <h2 className="text-lg mb-8 text-white">Logo Preview - Dark Background</h2>
          <img src={logo} alt="keurope logo" className="h-16 w-auto invert" />
        </div>

        <div className="bg-white p-12 rounded-lg shadow-sm border">
          <h2 className="text-lg mb-8 text-gray-600">Different Sizes</h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Small (32px)</p>
              <img src={logo} alt="keurope logo" className="h-8 w-auto" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Medium (48px)</p>
              <img src={logo} alt="keurope logo" className="h-12 w-auto" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Large (64px)</p>
              <img src={logo} alt="keurope logo" className="h-16 w-auto" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Extra Large (96px)</p>
              <img src={logo} alt="keurope logo" className="h-24 w-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
