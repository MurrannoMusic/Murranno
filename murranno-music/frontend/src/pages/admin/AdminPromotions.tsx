import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Package, Tag, Upload, X, ImagePlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePromotionServices } from '@/hooks/usePromotionServices';
import { usePromotionBundles } from '@/hooks/usePromotionBundles';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { CloudinaryImage } from '@/components/ui/cloudinary-image';
import { PromotionCategory, PromotionService, PromotionBundle } from '@/types/promotion';

interface ServiceFormData {
  name: string;
  category: PromotionCategory;
  description: string;
  price: string;
  duration: string;
  features: string;
  imageUrl: string;
  images: string[];
  videos: string[];
}

interface BundleFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  tierLevel: string;
  targetDescription: string;
  serviceIds: string[];
  imageUrl: string;
}

export default function AdminPromotions() {
  const { services, loading: servicesLoading, categories, refetch: refetchServices } = usePromotionServices();
  const { bundles, loading: bundlesLoading, refetch: refetchBundles } = usePromotionBundles();
  const { uploadImage, uploading, progress } = useCloudinaryUpload();

  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [bundleDialogOpen, setBundleDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<PromotionService | null>(null);
  const [editingBundle, setEditingBundle] = useState<PromotionBundle | null>(null);

  const [serviceForm, setServiceForm] = useState<ServiceFormData>({
    name: '',
    category: 'Streaming & Playlist Promotion',
    description: '',
    price: '',
    duration: '',
    features: '',
    imageUrl: '',
    images: [],
    videos: [],
  });

  const [bundleForm, setBundleForm] = useState<BundleFormData>({
    name: '',
    slug: '',
    description: '',
    price: '',
    tierLevel: '1',
    targetDescription: '',
    serviceIds: [],
    imageUrl: '',
  });

  const handleGalleryImageUpload = async (file: File) => {
    try {
      const result = await uploadImage(file, 'promotions/services/gallery');
      
      setServiceForm(prev => ({
        ...prev,
        images: [...prev.images, result.publicId],
      }));
      
      toast.success('Gallery image uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload gallery image');
    }
  };

  const removeGalleryImage = (index: number) => {
    setServiceForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleVideoUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'promotions/services/videos');

      const { data: { session } } = await supabase.auth.getSession();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-audio-cloudinary`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token ?? ''}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!,
        },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Upload failed (${res.status}): ${errText}`);
      }

      const data = await res.json();
      if (!data?.url) throw new Error('No URL returned from upload');
      
      setServiceForm(prev => ({
        ...prev,
        videos: [...prev.videos, data.url],
      }));
      
      toast.success('Video uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload video');
    }
  };

  const removeVideo = (index: number) => {
    setServiceForm(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (file: File, isBundle: boolean = false) => {
    try {
      const result = await uploadImage(file, isBundle ? 'promotions/bundles' : 'promotions/services');
      
      if (isBundle) {
        setBundleForm(prev => ({ ...prev, imageUrl: result.publicId }));
      } else {
        setServiceForm(prev => ({ ...prev, imageUrl: result.publicId }));
      }
      
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    }
  };

  const createService = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const { data: result, error } = await supabase
        .from('promotion_services')
        .insert({
          name: data.name,
          category: data.category,
          description: data.description,
          price: parseFloat(data.price),
          duration: data.duration,
          features: data.features.split('\n').filter(f => f.trim()),
          image_url: data.imageUrl,
          images: data.images,
          videos: data.videos,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Service created successfully');
      setServiceDialogOpen(false);
      resetServiceForm();
      refetchServices();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create service');
    },
  });

  const updateService = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ServiceFormData }) => {
      const { data: result, error } = await supabase
        .from('promotion_services')
        .update({
          name: data.name,
          category: data.category,
          description: data.description,
          price: parseFloat(data.price),
          duration: data.duration,
          features: data.features.split('\n').filter(f => f.trim()),
          image_url: data.imageUrl,
          images: data.images,
          videos: data.videos,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Service updated successfully');
      setServiceDialogOpen(false);
      resetServiceForm();
      refetchServices();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update service');
    },
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promotion_services')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Service deleted successfully');
      refetchServices();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete service');
    },
  });

  const createBundle = useMutation({
    mutationFn: async (data: BundleFormData) => {
      const { data: bundle, error } = await supabase
        .from('promotion_bundles')
        .insert({
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: parseFloat(data.price),
          tier_level: parseInt(data.tierLevel),
          target_description: data.targetDescription,
          image_url: data.imageUrl,
        })
        .select()
        .single();

      if (error) throw error;

      if (data.serviceIds.length > 0) {
        const { error: servicesError } = await supabase
          .from('bundle_services')
          .insert(
            data.serviceIds.map(serviceId => ({
              bundle_id: bundle.id,
              service_id: serviceId,
            }))
          );

        if (servicesError) throw servicesError;
      }

      return bundle;
    },
    onSuccess: () => {
      toast.success('Bundle created successfully');
      setBundleDialogOpen(false);
      resetBundleForm();
      refetchBundles();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create bundle');
    },
  });

  const updateBundle = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BundleFormData }) => {
      const { data: bundle, error } = await supabase
        .from('promotion_bundles')
        .update({
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: parseFloat(data.price),
          tier_level: parseInt(data.tierLevel),
          target_description: data.targetDescription,
          image_url: data.imageUrl,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('bundle_services').delete().eq('bundle_id', id);

      if (data.serviceIds.length > 0) {
        const { error: servicesError } = await supabase
          .from('bundle_services')
          .insert(
            data.serviceIds.map(serviceId => ({
              bundle_id: id,
              service_id: serviceId,
            }))
          );

        if (servicesError) throw servicesError;
      }

      return bundle;
    },
    onSuccess: () => {
      toast.success('Bundle updated successfully');
      setBundleDialogOpen(false);
      resetBundleForm();
      refetchBundles();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update bundle');
    },
  });

  const deleteBundle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promotion_bundles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Bundle deleted successfully');
      refetchBundles();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete bundle');
    },
  });

  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      category: 'Streaming & Playlist Promotion',
      description: '',
      price: '',
      duration: '',
      features: '',
      imageUrl: '',
      images: [],
      videos: [],
    });
    setEditingService(null);
  };

  const resetBundleForm = () => {
    setBundleForm({
      name: '',
      slug: '',
      description: '',
      price: '',
      tierLevel: '1',
      targetDescription: '',
      serviceIds: [],
      imageUrl: '',
    });
    setEditingBundle(null);
  };

  const openServiceDialog = (service?: PromotionService) => {
    if (service) {
      setServiceForm({
        name: service.name,
        category: service.category,
        description: service.description || '',
        price: service.price.toString(),
        duration: service.duration || '',
        features: (service.features || []).join('\n'),
        imageUrl: service.imageUrl || '',
        images: service.images || [],
        videos: service.videos || [],
      });
      setEditingService(service);
    } else {
      resetServiceForm();
    }
    setServiceDialogOpen(true);
  };

  const openBundleDialog = async (bundle?: PromotionBundle) => {
    if (bundle) {
      const { data: bundleServices } = await supabase
        .from('bundle_services')
        .select('service_id')
        .eq('bundle_id', bundle.id);

      setBundleForm({
        name: bundle.name,
        slug: bundle.slug,
        description: bundle.description || '',
        price: bundle.price.toString(),
        tierLevel: bundle.tierLevel.toString(),
        targetDescription: bundle.targetDescription || '',
        serviceIds: bundleServices?.map(bs => bs.service_id) || [],
        imageUrl: bundle.imageUrl || '',
      });
      setEditingBundle(bundle);
    } else {
      resetBundleForm();
    }
    setBundleDialogOpen(true);
  };

  const handleServiceSubmit = () => {
    if (editingService) {
      updateService.mutate({ id: editingService.id, data: serviceForm });
    } else {
      createService.mutate(serviceForm);
    }
  };

  const handleBundleSubmit = () => {
    if (editingBundle) {
      updateBundle.mutate({ id: editingBundle.id, data: bundleForm });
    } else {
      createBundle.mutate(bundleForm);
    }
  };

  const handleDeleteService = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      deleteService.mutate(id);
    }
  };

  const handleDeleteBundle = (id: string) => {
    if (confirm('Are you sure you want to delete this bundle?')) {
      deleteBundle.mutate(id);
    }
  };

  const toggleServiceInBundle = (serviceId: string) => {
    setBundleForm(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Promotion Management</h2>
          <p className="text-muted-foreground">Manage promotional services and bundles</p>
        </div>

        {/* Services Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Promotion Services
                </CardTitle>
                <CardDescription>Manage individual promotional services</CardDescription>
              </div>
              <Button onClick={() => openServiceDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Service
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {servicesLoading ? (
              <div className="text-center py-8">Loading services...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Images</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{service.category}</Badge>
                      </TableCell>
                      <TableCell>₦{service.price.toLocaleString()}</TableCell>
                      <TableCell>{service.duration || 'N/A'}</TableCell>
                      <TableCell>
                        {service.images && service.images.length > 0 ? (
                          <Badge variant="secondary">{service.images.length} images</Badge>
                        ) : service.imageUrl ? (
                          <Badge variant="secondary">1 image</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No images</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={service.isActive ? 'default' : 'secondary'}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openServiceDialog(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Bundles Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Promotion Bundles
                </CardTitle>
                <CardDescription>Manage bundled promotional packages</CardDescription>
              </div>
              <Button onClick={() => openBundleDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Bundle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {bundlesLoading ? (
              <div className="text-center py-8">Loading bundles...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bundles.map((bundle) => (
                    <TableRow key={bundle.id}>
                      <TableCell className="font-medium">{bundle.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{bundle.slug}</code>
                      </TableCell>
                      <TableCell>₦{bundle.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge>Tier {bundle.tierLevel}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={bundle.isActive ? 'default' : 'secondary'}>
                          {bundle.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openBundleDialog(bundle)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteBundle(bundle.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Service Dialog */}
        <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </DialogTitle>
              <DialogDescription>
                {editingService ? 'Update service details' : 'Create a new promotional service'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="service-name">Service Name</Label>
                <Input
                  id="service-name"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="Instagram Story Promotion"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-category">Category</Label>
                <Select
                  value={serviceForm.category}
                  onValueChange={(value) =>
                    setServiceForm({ ...serviceForm, category: value as PromotionCategory })
                  }
                >
                  <SelectTrigger id="service-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-description">Description</Label>
                <Textarea
                  id="service-description"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Brief description of the service..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service-price">Price (₦)</Label>
                  <Input
                    id="service-price"
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    placeholder="50000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-duration">Duration</Label>
                  <Input
                    id="service-duration"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                    placeholder="7 days"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-features">Features (one per line)</Label>
                <Textarea
                  id="service-features"
                  value={serviceForm.features}
                  onChange={(e) => setServiceForm({ ...serviceForm, features: e.target.value })}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Main Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, false);
                    }}
                    disabled={uploading}
                  />
                  {uploading && <span className="text-sm text-muted-foreground">{progress}%</span>}
                </div>
                {serviceForm.imageUrl && (
                  <div className="relative w-32 h-32 mt-2">
                    <CloudinaryImage
                      publicId={serviceForm.imageUrl}
                      alt="Service image"
                      width={200}
                      height={200}
                      className="w-full h-full object-cover rounded"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => setServiceForm({ ...serviceForm, imageUrl: '' })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImagePlus className="h-4 w-4" />
                  Image Gallery
                </Label>
                <p className="text-sm text-muted-foreground">
                  Add multiple images to showcase campaign examples
                </p>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleGalleryImageUpload(file);
                    }}
                    disabled={uploading}
                  />
                  {uploading && <span className="text-sm text-muted-foreground">{progress}%</span>}
                </div>
                
                {serviceForm.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {serviceForm.images.map((imageId, index) => (
                      <div key={index} className="relative group">
                        <CloudinaryImage
                          publicId={imageId}
                          alt={`Gallery image ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-24 object-cover rounded"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeGalleryImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Video Gallery
                </Label>
                <p className="text-sm text-muted-foreground">
                  Add videos to showcase campaign examples and testimonials
                </p>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleVideoUpload(file);
                    }}
                    disabled={uploading}
                  />
                  {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                </div>
                
                {serviceForm.videos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {serviceForm.videos.map((videoUrl, index) => (
                      <div key={index} className="relative group">
                        <video
                          src={videoUrl}
                          controls
                          className="w-full h-32 object-cover rounded"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeVideo(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setServiceDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleServiceSubmit} disabled={uploading}>
                {editingService ? 'Update' : 'Create'} Service
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bundle Dialog */}
        <Dialog open={bundleDialogOpen} onOpenChange={setBundleDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBundle ? 'Edit Bundle' : 'Add New Bundle'}
              </DialogTitle>
              <DialogDescription>
                {editingBundle ? 'Update bundle details' : 'Create a new promotional bundle'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bundle-name">Bundle Name</Label>
                <Input
                  id="bundle-name"
                  value={bundleForm.name}
                  onChange={(e) => setBundleForm({ ...bundleForm, name: e.target.value })}
                  placeholder="Starter Package"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bundle-slug">Slug</Label>
                <Input
                  id="bundle-slug"
                  value={bundleForm.slug}
                  onChange={(e) =>
                    setBundleForm({ ...bundleForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                  }
                  placeholder="starter-package"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bundle-description">Description</Label>
                <Textarea
                  id="bundle-description"
                  value={bundleForm.description}
                  onChange={(e) => setBundleForm({ ...bundleForm, description: e.target.value })}
                  placeholder="Brief description of the bundle..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bundle-price">Price (₦)</Label>
                  <Input
                    id="bundle-price"
                    type="number"
                    value={bundleForm.price}
                    onChange={(e) => setBundleForm({ ...bundleForm, price: e.target.value })}
                    placeholder="200000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bundle-tier">Tier Level</Label>
                  <Input
                    id="bundle-tier"
                    type="number"
                    value={bundleForm.tierLevel}
                    onChange={(e) => setBundleForm({ ...bundleForm, tierLevel: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bundle-target">Target Description</Label>
                <Textarea
                  id="bundle-target"
                  value={bundleForm.targetDescription}
                  onChange={(e) => setBundleForm({ ...bundleForm, targetDescription: e.target.value })}
                  placeholder="Who is this bundle for?"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Bundle Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, true);
                    }}
                    disabled={uploading}
                  />
                  {uploading && <span className="text-sm text-muted-foreground">{progress}%</span>}
                </div>
                {bundleForm.imageUrl && (
                  <div className="relative w-32 h-32 mt-2">
                    <CloudinaryImage
                      publicId={bundleForm.imageUrl}
                      alt="Bundle image"
                      width={200}
                      height={200}
                      className="w-full h-full object-cover rounded"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => setBundleForm({ ...bundleForm, imageUrl: '' })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Included Services</Label>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                      onClick={() => toggleServiceInBundle(service.id)}
                    >
                      <input
                        type="checkbox"
                        checked={bundleForm.serviceIds.includes(service.id)}
                        onChange={() => toggleServiceInBundle(service.id)}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{service.name}</div>
                        <div className="text-xs text-muted-foreground">{service.category}</div>
                      </div>
                      <div className="text-sm font-medium">₦{service.price.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setBundleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBundleSubmit} disabled={uploading}>
                {editingBundle ? 'Update' : 'Create'} Bundle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
