export const Craftsmanship = () => {
  return (
    <div className="w-full bg-gradient-to-b from-[#F9FAFB] to-white py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Side */}
          <div className="relative order-2 lg:order-1">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#0D2C45] to-[#16C1A8] shadow-2xl">
              {/* Placeholder for fabric close-up image */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-white/20 text-center">
                  <p className="text-sm font-medium">220gsm Premium Cotton</p>
                  <p className="text-xs">Fabric Close-up</p>
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="flex flex-col gap-2">
                <p className="text-4xl font-bold text-[#16C1A8]">220gsm</p>
                <p className="text-sm text-[#64748B]">Premium Weight</p>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="flex flex-col gap-6 order-1 lg:order-2">
            <div className="flex flex-col gap-4">
              <h2 className="text-[#FF8A26] font-semibold text-sm uppercase tracking-wider">
                Craftsmanship
              </h2>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1E293B] tracking-tight">
                Premium materials meet expert craftsmanship
              </h3>
            </div>

            <div className="flex flex-col gap-6 text-lg text-[#64748B] leading-relaxed">
              <p>
                We use <span className="font-semibold text-[#1E293B]">premium, heavyweight cotton</span> with hand-finished prints. Every garment is crafted to the same standards as high-end streetwear.
              </p>
              <p>
                Your idea deserves the same quality as luxury brands. That's why we partner with the best manufacturers and use only <span className="font-semibold text-[#1E293B]">220gsm organic cotton</span> — the kind of fabric that gets better with every wash.
              </p>
            </div>

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {[
                { label: 'Organic Cotton', value: '100%' },
                { label: 'Fabric Weight', value: '220gsm' },
                { label: 'Print Quality', value: 'Premium DTG' },
                { label: 'Durability', value: 'Long-lasting' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-1 p-4 rounded-xl bg-white border border-gray-200"
                >
                  <p className="text-2xl font-bold text-[#16C1A8]">{item.value}</p>
                  <p className="text-sm text-[#64748B]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
