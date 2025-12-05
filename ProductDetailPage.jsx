import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProduct, getProductQuantities } from '@/api/EcommerceApi';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/use-toast';
import { ShoppingCart, Loader2, ArrowLeft, CheckCircle, Minus, Plus, XCircle, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmMNGYiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = useCallback(async () => {
    if (product && selectedVariant) {
      const availableQuantity = selectedVariant.inventory_quantity;
      try {
        await addToCart(product, selectedVariant, quantity, availableQuantity);
        toast({
          title: "Added to Cart! 🛒",
          description: `${quantity} x ${product.title} (${selectedVariant.title}) added.`,
          className: "bg-green-50 border-green-200",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Oh no! Something went wrong.",
          description: error.message,
        });
      }
    }
  }, [product, selectedVariant, quantity, addToCart, toast]);

  const handleQuantityChange = useCallback((amount) => {
    setQuantity(prevQuantity => {
        const newQuantity = prevQuantity + amount;
        if (newQuantity < 1) return 1;
        return newQuantity;
    });
  }, []);

  const handlePrevImage = useCallback(() => {
    if (product?.images?.length > 1) {
      setCurrentImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1);
    }
  }, [product?.images?.length]);

  const handleNextImage = useCallback(() => {
    if (product?.images?.length > 1) {
      setCurrentImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1);
    }
  }, [product?.images?.length]);

  const handleVariantSelect = useCallback((variant) => {
    setSelectedVariant(variant);
    if (variant.image_url && product?.images?.length > 0) {
      const imageIndex = product.images.findIndex(image => image.url === variant.image_url);
      if (imageIndex !== -1) {
        setCurrentImageIndex(imageIndex);
      }
    }
  }, [product?.images]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedProduct = await getProduct(id);

        try {
          const quantitiesResponse = await getProductQuantities({
            fields: 'inventory_quantity',
            product_ids: [fetchedProduct.id]
          });

          const variantQuantityMap = new Map();
          quantitiesResponse.variants.forEach(variant => {
            variantQuantityMap.set(variant.id, variant.inventory_quantity);
          });

          const productWithQuantities = {
            ...fetchedProduct,
            variants: fetchedProduct.variants.map(variant => ({
              ...variant,
              inventory_quantity: variantQuantityMap.get(variant.id) ?? variant.inventory_quantity
            }))
          };

          setProduct(productWithQuantities);
          if (productWithQuantities.variants && productWithQuantities.variants.length > 0) {
            setSelectedVariant(productWithQuantities.variants[0]);
          }
        } catch (quantityError) {
          throw quantityError;
        }
      } catch (err) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-10 flex justify-center items-center">
        <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-24 pb-10 max-w-7xl mx-auto px-4">
        <Link to="/store" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6 font-medium">
          <ArrowLeft size={16} />
          Back to Store
        </Link>
        <div className="text-center p-12 bg-red-50 rounded-2xl border border-red-100 max-w-2xl mx-auto">
          <XCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Product Not Found</h2>
          <p className="text-red-500 mb-6">{error || "The product you are looking for is unavailable."}</p>
          <Link to="/store">
            <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">Return to Store</Button>
          </Link>
        </div>
      </div>
    );
  }

  const price = selectedVariant?.sale_price_formatted ?? selectedVariant?.price_formatted;
  const originalPrice = selectedVariant?.price_formatted;
  const availableStock = selectedVariant ? selectedVariant.inventory_quantity : 0;
  const isStockManaged = selectedVariant?.manage_inventory ?? false;
  const canAddToCart = !isStockManaged || quantity <= availableStock;
  const currentImage = product.images[currentImageIndex];
  const hasMultipleImages = product.images.length > 1;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <Helmet>
        <title>{product.title} | IMA Hosur Store</title>
        <meta name="description" content={product.description?.substring(0, 160) || product.title} />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/store" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-8 font-medium group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Store
        </Link>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid lg:grid-cols-2 gap-0 border border-gray-100">
          {/* Image Section */}
          <div className="p-8 lg:p-12 bg-gray-50 flex flex-col items-center justify-center relative">
            <div className="relative w-full aspect-square max-w-lg bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={!currentImage?.url ? placeholderImage : currentImage.url}
                alt={product.title}
                className="w-full h-full object-contain p-4"
              />

              {hasMultipleImages && (
                <>
                  <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all border border-gray-100">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all border border-gray-100">
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {hasMultipleImages && (
              <div className="flex gap-3 mt-6 overflow-x-auto pb-2 max-w-full">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent hover:border-gray-300 bg-white'
                    }`}
                  >
                    <img
                      src={!image.url ? placeholderImage : image.url}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="p-8 lg:p-12 flex flex-col h-full">
            <div className="mb-2">
              {product.ribbon_text && (
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
                  {product.ribbon_text}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">{product.title}</h1>
              <p className="text-lg text-gray-500 font-medium">{product.subtitle}</p>
            </div>

            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
              <span className="text-4xl font-bold text-blue-600">{price}</span>
              {selectedVariant?.sale_price_in_cents && (
                <span className="text-xl text-gray-400 line-through">{originalPrice}</span>
              )}
            </div>

            <div className="prose prose-gray max-w-none mb-8 text-gray-600" dangerouslySetInnerHTML={{ __html: product.description }} />

            {product.variants.length > 1 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Select Option</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map(variant => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantSelect(variant)}
                      className={`px-6 py-2 rounded-lg border font-medium transition-all ${
                        selectedVariant?.id === variant.id 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {variant.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto space-y-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center border border-gray-300 rounded-xl">
                  <button onClick={() => handleQuantityChange(-1)} className="p-3 hover:bg-gray-50 rounded-l-xl text-gray-600 transition-colors">
                    <Minus size={20} />
                  </button>
                  <span className="w-12 text-center font-bold text-lg text-gray-900">{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} className="p-3 hover:bg-gray-50 rounded-r-xl text-gray-600 transition-colors">
                    <Plus size={20} />
                  </button>
                </div>
                
                <div className="flex-grow">
                   <Button 
                    onClick={handleAddToCart} 
                    size="lg" 
                    disabled={!canAddToCart || !product.purchasable}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl shadow-lg shadow-blue-200"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">
                {isStockManaged && canAddToCart && product.purchasable && (
                  <span className="flex items-center text-green-600 font-medium">
                    <CheckCircle size={16} className="mr-2" /> In Stock ({availableStock} available)
                  </span>
                )}
                {(!canAddToCart || !product.purchasable) && (
                  <span className="flex items-center text-red-500 font-medium">
                    <XCircle size={16} className="mr-2" /> Out of Stock
                  </span>
                )}
                <span className="flex items-center mt-2 sm:mt-0">
                  <ShieldCheck size={16} className="mr-2 text-blue-600" /> Secure transaction
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;