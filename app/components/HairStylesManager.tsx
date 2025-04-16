import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Check, X, Sparkles, RefreshCw, Layers, PlusCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface HairStyle {
  _id: string
  category: string
  name: string
  value: string
  isActive: boolean
}

interface ServiceCategory {
  _id: string
  name: string
  description: string
  isActive: boolean
  order: number
  createdAt?: string
  updatedAt?: string
}

export default function HairStylesManager() {
  const [hairStyles, setHairStyles] = useState<HairStyle[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [newStyle, setNewStyle] = useState({
    category: '',
    name: '',
    value: '',
    isActive: true
  })
  
  const [editingStyle, setEditingStyle] = useState<HairStyle | null>(null)
  const [seedingStatus, setSeedingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  
  // Category management state
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    isActive: true
  })
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null)
  
  // Add this new state to the component after other state declarations
  const [deletingStyle, setDeletingStyle] = useState<string | null>(null)
  
  // Add a state variable to track which category is being deleted
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null)
  
  // Get categories for dropdown - ensure categories is an array before filtering
  const categoryOptions = Array.isArray(categories) 
    ? categories
        .filter(cat => cat.isActive)
        .sort((a, b) => a.order - b.order)
        .map(cat => cat.name)
    : [];

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchHairStyles(), fetchCategories()]);
    };
    loadData();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/service-categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      
      // Ensure categories is an array
      setCategories(Array.isArray(data) ? data : []);
      
      // If there are no categories, seed the default ones
      if (Array.isArray(data) && data.length === 0) {
        await seedDefaultCategories();
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
      setCategories([]); // Set to empty array on error
    }
  };
  
  const seedDefaultCategories = async () => {
    try {
      const response = await fetch('/api/seed-categories');
      if (!response.ok) {
        throw new Error('Failed to seed default categories');
      }
      await fetchCategories();
    } catch (error) {
      console.error('Error seeding default categories:', error);
    }
  };
  
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.name) {
      setError('Category name is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/service-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add category');
      }
      
      await fetchCategories();
      setSuccess('Category added successfully');
      setNewCategory({
        name: '',
        description: '',
        isActive: true
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to add category');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCategory || !editingCategory.name) {
      setError('Category name is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/service-categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingCategory),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update category');
      }
      
      await fetchCategories();
      setSuccess('Category updated successfully');
      setEditingCategory(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to update category');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This may affect hair styles using this category.')) {
      return;
    }
    
    try {
      setError(null);
      setDeletingCategory(id); // Set deleting category state
      
      // Create a slight delay before actual deletion to allow animation to be noticed
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const response = await fetch(`/api/service-categories?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete category');
      }
      
      await fetchCategories();
      setSuccess('Category deleted successfully');
      setDeletingCategory(null); // Reset deleting state
      
    } catch (error) {
      setDeletingCategory(null); // Reset on error
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to delete category');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHairStyles = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/hair-styles')
      if (!response.ok) {
        throw new Error('Failed to fetch hair styles')
      }
      const data = await response.json()
      setHairStyles(Array.isArray(data) ? data : [])
    } catch (error) {
      setError('Failed to load hair styles')
      console.error(error)
      setHairStyles([])
    } finally {
      setLoading(false)
    }
  }

  const handleSeedDefaultStyles = async (force: boolean = false) => {
    try {
      setSeedingStatus('loading')
      setError(null)
      setSuccess(null)
      
      const options = force ? {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force }),
      } : undefined
      
      const response = await fetch('/api/seed-hairstyles', options)
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to seed default hairstyles')
      }
      
      const result = await response.json()
      setSuccess(result.message)
      setSeedingStatus('success')
      
      // Refresh the list
      await fetchHairStyles()
    } catch (error) {
      setSeedingStatus('error')
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to seed default hairstyles')
      }
      console.error(error)
      // Ensure we still try to fetch hairstyles even if seeding failed
      await fetchHairStyles()
    } finally {
      setSeedingStatus('idle')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (editingStyle) {
      setEditingStyle({
        ...editingStyle,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      })
    } else {
      setNewStyle({
        ...newStyle,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      })
    }
  }

  const generateValue = (category: string, name: string) => {
    if (!category || !name) return ''
    
    // Convert to lowercase, replace spaces with hyphens, and remove special characters
    const baseValue = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    // Add category prefix
    const categoryPrefix = category.toLowerCase().replace(/\s+/g, '-')
    
    return `${categoryPrefix}-${baseValue}`
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value
    
    if (editingStyle) {
      const updatedStyle = {
        ...editingStyle,
        category,
        value: generateValue(category, editingStyle.name)
      }
      setEditingStyle(updatedStyle)
    } else {
      const updatedStyle = {
        ...newStyle,
        category,
        value: generateValue(category, newStyle.name)
      }
      setNewStyle(updatedStyle)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    
    if (editingStyle) {
      const updatedStyle = {
        ...editingStyle,
        name,
        value: generateValue(editingStyle.category, name)
      }
      setEditingStyle(updatedStyle)
    } else {
      const updatedStyle = {
        ...newStyle,
        name,
        value: generateValue(newStyle.category, name)
      }
      setNewStyle(updatedStyle)
    }
  }

  const handleAddStyle = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newStyle.category || !newStyle.name) {
      setError('Category and name are required')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/hair-styles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStyle),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add hair style')
      }
      
      await fetchHairStyles()
      setSuccess('Hair style added successfully')
      setNewStyle({
        category: '',
        name: '',
        value: '',
        isActive: true
      })
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to add hair style')
      }
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStyle = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingStyle || !editingStyle.category || !editingStyle.name) {
      setError('Category and name are required')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/hair-styles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingStyle),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update hair style')
      }
      
      await fetchHairStyles()
      setSuccess('Hair style updated successfully')
      setEditingStyle(null)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to update hair style')
      }
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStyle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hair style?')) {
      return
    }
    
    try {
      setError(null)
      setDeletingStyle(id) // Set deleting state
      
      // Create a slight delay before actual deletion to allow animation to be noticed
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const response = await fetch(`/api/hair-styles?id=${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete hair style')
      }
      
      await fetchHairStyles()
      setSuccess('Hair style deleted successfully')
      setDeletingStyle(null) // Reset deleting state
      
    } catch (error) {
      setDeletingStyle(null) // Reset on error
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to delete hair style')
      }
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (style: HairStyle) => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedStyle = {
        ...style,
        isActive: !style.isActive
      }
      
      const response = await fetch('/api/hair-styles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedStyle),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update hair style')
      }
      
      await fetchHairStyles()
      setSuccess(`Hair style ${updatedStyle.isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to update hair style')
      }
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Add a new handler function for category name input changes
  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewCategory(prev => ({...prev, name: value}));
  };

  // Add a new handler function for category description input changes
  const handleCategoryDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewCategory(prev => ({...prev, description: value}));
  };

  // Add a new handler function for category active checkbox changes
  const handleCategoryActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setNewCategory(prev => ({...prev, isActive: checked}));
  };

  // Add handlers for editing category fields
  const handleEditCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingCategory) {
      const value = e.target.value;
      setEditingCategory({...editingCategory, name: value});
    }
  };

  const handleEditCategoryDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingCategory) {
      const value = e.target.value;
      setEditingCategory({...editingCategory, description: value});
    }
  };

  const handleEditCategoryActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingCategory) {
      const checked = e.target.checked;
      setEditingCategory({...editingCategory, isActive: checked});
    }
  };

  // Ensure hairStyles is an array before using reduce
  const groupedStyles = Array.isArray(hairStyles) 
    ? hairStyles.reduce((acc, style) => {
        if (!acc[style.category]) {
          acc[style.category] = []
        }
        acc[style.category].push(style)
        return acc
      }, {} as Record<string, HairStyle[]>)
    : {} as Record<string, HairStyle[]>

  // Add this new component inside the HairStylesManager function
  const CategoryManager = () => {
    // Create local state for the form fields to prevent focus loss
    const [localCategoryName, setLocalCategoryName] = useState(newCategory.name);
    const [localCategoryDescription, setLocalCategoryDescription] = useState(newCategory.description);
    
    // For editing
    const [localEditName, setLocalEditName] = useState('');
    const [localEditDescription, setLocalEditDescription] = useState('');
    
    // Set local state when editing category changes
    useEffect(() => {
      if (editingCategory) {
        setLocalEditName(editingCategory.name);
        setLocalEditDescription(editingCategory.description);
      }
    }, [editingCategory]);
    
    // Handle form submission for new category
    const handleSubmitNewCategory = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Update parent state immediately before submitting
      setNewCategory({
        ...newCategory,
        name: localCategoryName,
        description: localCategoryDescription
      });
      
      // Use the updated values directly for submission
      const updatedCategory = {
        ...newCategory,
        name: localCategoryName,
        description: localCategoryDescription
      };
      
      try {
        setLoading(true);
        setError(null);
        
        fetch('/api/service-categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedCategory),
        })
        .then(response => {
          if (!response.ok) {
            return response.json().then(data => {
              throw new Error(data.error || 'Failed to add category');
            });
          }
          return fetchCategories();
        })
        .then(() => {
          setSuccess('Category added successfully');
          // Reset local and parent state
          setLocalCategoryName('');
          setLocalCategoryDescription('');
          setNewCategory({
            name: '',
            description: '',
            isActive: true
          });
        })
        .catch(error => {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError('Failed to add category');
          }
          console.error(error);
        })
        .finally(() => {
          setLoading(false);
        });
      } catch (error) {
        setLoading(false);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to add category');
        }
        console.error(error);
      }
    };
    
    // Handle form submission for editing category
    const handleSubmitEditCategory = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!editingCategory) return;
      
      const updatedCategory = {
        ...editingCategory,
        name: localEditName,
        description: localEditDescription
      };
      
      try {
        setLoading(true);
        setError(null);
        
        fetch('/api/service-categories', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedCategory),
        })
        .then(response => {
          if (!response.ok) {
            return response.json().then(data => {
              throw new Error(data.error || 'Failed to update category');
            });
          }
          return fetchCategories();
        })
        .then(() => {
          setSuccess('Category updated successfully');
          setEditingCategory(null);
        })
        .catch(error => {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError('Failed to update category');
          }
          console.error(error);
        })
        .finally(() => {
          setLoading(false);
        });
      } catch (error) {
        setLoading(false);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to update category');
        }
        console.error(error);
      }
    };

  return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-gray-800 p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-['Noto_Serif_Display'] text-white">Manage Service Categories</h3>
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowCategoryManager(false);
            }}
            className="text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        
        {editingCategory ? (
          <div className="space-y-4">
            <h4 className="text-xs text-gray-400 uppercase tracking-wider">Edit Category</h4>
            <form onSubmit={handleSubmitEditCategory} className="space-y-3">
              <div>
                <label className="lash-label">Category Name</label>
                <input
                  type="text"
                  value={localEditName}
                  onChange={(e) => setLocalEditName(e.target.value)}
                  className="hair-style-input"
                  required
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="lash-label">Description (Optional)</label>
                <input
                  type="text"
                  value={localEditDescription}
                  onChange={(e) => setLocalEditDescription(e.target.value)}
                  className="hair-style-input"
                  autoComplete="off"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingCategory.isActive}
                  onChange={handleEditCategoryActiveChange}
                  className="mr-2 h-5 w-5 text-pink-600 bg-black/60 border-gray-700 rounded focus:ring-pink-500/30"
                />
                <span className="text-gray-300 text-sm">Active</span>
              </div>
              <div className="flex justify-end gap-2">
          <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-3 py-1.5 text-gray-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="hair-style-button"
                  disabled={loading}
                >
                  <Check size={16} />
                  Update Category
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="text-xs text-gray-400 uppercase tracking-wider">Add New Category</h4>
            <form onSubmit={handleSubmitNewCategory} className="space-y-3">
              <div>
                <label className="lash-label">Category Name</label>
                <input
                  type="text"
                  value={localCategoryName}
                  onChange={(e) => setLocalCategoryName(e.target.value)}
                  className="hair-style-input"
                  required
                  placeholder="e.g. BRAIDS, TWIST, etc."
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="lash-label">Description (Optional)</label>
                <input
                  type="text"
                  value={localCategoryDescription}
                  onChange={(e) => setLocalCategoryDescription(e.target.value)}
                  className="hair-style-input"
                  placeholder="Short description of this category"
                  autoComplete="off"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newCategory.isActive}
                  onChange={handleCategoryActiveChange}
                  className="mr-2 h-5 w-5 text-pink-600 bg-black/60 border-gray-700 rounded focus:ring-pink-500/30"
                />
                <span className="text-gray-300 text-sm">Active</span>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="hair-style-button"
                  disabled={loading}
                >
                  <Plus size={16} />
                  Add Category
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="border-t border-gray-800 pt-4">
          <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Existing Categories</h4>
          <div className="space-y-2 category-container pr-1">
            {categories.length === 0 ? (
              <p className="text-gray-400 text-sm">No categories found.</p>
            ) : (
              categories.map(category => (
                <motion.div 
                  key={category._id} 
                  className="bg-black/60 p-3 rounded border border-gray-800 flex justify-between items-center"
                  initial={{ opacity: 1, x: 0 }}
                  animate={{ 
                    opacity: deletingCategory === category._id ? 0.3 : 1,
                    x: deletingCategory === category._id ? 50 : 0,
                    scale: deletingCategory === category._id ? 0.95 : 1,
                    backgroundColor: deletingCategory === category._id ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${category.isActive ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                      <h5 className="text-white">{category.name}</h5>
                    </div>
                    {category.description && (
                      <p className="text-xs text-gray-400 mt-1">{category.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="p-1 rounded-full text-blue-400 hover:bg-blue-500/10"
                      disabled={deletingCategory === category._id}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="p-1 rounded-full text-red-400 hover:bg-red-500/10"
                      disabled={deletingCategory === category._id}
                    >
                      {deletingCategory === category._id ? (
                        <span className="px-2 animate-pulse text-xs">Deleting...</span>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-gray-800 p-4 space-y-4 max-h-[calc(100vh-180px)] overflow-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-['Noto_Serif_Display'] text-white">Hair Styles Manager</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryManager(true)}
            className="px-2 py-1 text-xs bg-pink-500/20 text-pink-200 rounded hover:bg-pink-500/30 flex items-center gap-1 transition"
          >
            <Layers size={12} />
            Categories
          </button>
          <button
            onClick={() => handleSeedDefaultStyles()}
            disabled={seedingStatus === 'loading'}
            className="px-2 py-1 text-xs bg-pink-500/20 text-pink-200 rounded hover:bg-pink-500/30 flex items-center gap-1 transition"
            title="Add default hairstyles if none exist"
          >
            <Sparkles size={12} />
            {seedingStatus === 'loading' ? 'Seeding...' : 'Seed'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-700/50 text-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-900/30 border border-green-700/50 text-green-200 rounded-lg text-sm">
          {success}
        </div>
      )}
      
      {showCategoryManager ? (
        <CategoryManager />
      ) : (
        <>
      {editingStyle ? (
            <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
              <h3 className="text-sm font-['Noto_Serif_Display'] text-white mb-3">Edit Hair Style</h3>
          <form onSubmit={handleUpdateStyle} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                    <label className="lash-label">Category</label>
                    <div className="relative">
                <select
                  name="category"
                  value={editingStyle.category}
                  onChange={handleCategoryChange}
                        className="hair-style-input pr-12"
                  required
                >
                  <option value="">Select Category</option>
                        {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                      <button
                        type="button"
                        onClick={() => setShowCategoryManager(true)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-pink-400 hover:text-pink-300"
                        title="Manage Categories"
                      >
                        <PlusCircle size={16} />
                      </button>
                    </div>
              </div>
              
              <div>
                    <label className="lash-label">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editingStyle.name}
                  onChange={handleNameChange}
                      className="hair-style-input"
                  required
                />
              </div>
              
              <div>
                    <label className="lash-label">Value (auto-generated)</label>
                <input
                  type="text"
                  name="value"
                  value={editingStyle.value}
                  readOnly
                      className="hair-style-input bg-black/60"
                />
              </div>
              
                  <div className="flex items-center pt-5">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={editingStyle.isActive}
                    onChange={handleInputChange}
                        className="mr-2 h-5 w-5 text-pink-600 bg-black/60 border-gray-700 rounded focus:ring-pink-500/30"
                  />
                      <span className="text-gray-300 text-sm">Active</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingStyle(null)}
                    className="px-3 py-1.5 text-gray-400 hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                    className="hair-style-button"
                disabled={loading}
              >
                <Check size={16} />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
            <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
              <h3 className="text-sm font-['Noto_Serif_Display'] text-white mb-3">Add New Hair Style</h3>
          <form onSubmit={handleAddStyle} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                    <label className="lash-label">Category</label>
                    <div className="relative">
                <select
                  name="category"
                  value={newStyle.category}
                  onChange={handleCategoryChange}
                        className="hair-style-input pr-12"
                  required
                >
                  <option value="">Select Category</option>
                        {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                      <button
                        type="button"
                        onClick={() => setShowCategoryManager(true)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-pink-400 hover:text-pink-300"
                        title="Manage Categories"
                      >
                        <PlusCircle size={16} />
                      </button>
                    </div>
              </div>
              
              <div>
                    <label className="lash-label">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newStyle.name}
                  onChange={handleNameChange}
                      className="hair-style-input"
                  required
                  placeholder="e.g. Faux Locs - Medium"
                />
              </div>
              
              <div>
                    <label className="lash-label">Value (auto-generated)</label>
                <input
                  type="text"
                  name="value"
                  value={newStyle.value}
                  readOnly
                      className="hair-style-input bg-black/60"
                />
              </div>
              
                  <div className="flex items-center pt-5">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={newStyle.isActive}
                    onChange={handleInputChange}
                        className="mr-2 h-5 w-5 text-pink-600 bg-black/60 border-gray-700 rounded focus:ring-pink-500/30"
                  />
                      <span className="text-gray-300 text-sm">Active</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                    className="hair-style-button"
                disabled={loading}
              >
                <Plus size={16} />
                Add Hair Style
              </button>
            </div>
          </form>
        </div>
      )}
      
          <div className="space-y-4">
            {loading && !showCategoryManager && <p className="text-center text-gray-400 text-sm py-4">Loading...</p>}
        
            {!loading && Object.keys(groupedStyles).length === 0 && !showCategoryManager && (
              <p className="text-center text-gray-400 text-sm py-4">No hair styles found. Add your first style above.</p>
        )}
        
            {!showCategoryManager && (
              <div className="h-[500px] overflow-auto border border-gray-800 rounded-lg admin-table-wrapper">
          {Object.entries(groupedStyles).map(([category, styles]) => (
            <div key={category} className="mb-4 last:mb-0">
                    <div className="bg-pink-500/20 px-4 py-2 text-sm font-['Noto_Serif_Display'] text-white sticky top-0 z-10">{category}</div>
                    <table className="w-full table-fixed admin-table">
                      <thead>
                        <tr>
                          <th className="w-1/2">Style Name</th>
                          <th className="w-1/6">Status</th>
                          <th className="w-1/3 text-right">Actions</th>
                  </tr>
                </thead>
                      <tbody>
                  {styles.map(style => (
                          <motion.tr 
                            key={style._id}
                            initial={{ opacity: 1, x: 0 }}
                            animate={{ 
                              opacity: deletingStyle === style._id ? 0.3 : 1,
                              x: deletingStyle === style._id ? 50 : 0,
                              scale: deletingStyle === style._id ? 0.95 : 1,
                              backgroundColor: deletingStyle === style._id ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                            }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            style={{ position: 'relative' }}
                          >
                      <td className="px-4 py-3">
                              <div className="text-white">{style.name}</div>
                              <div className="text-xs text-gray-400 truncate" title={style.value}>{style.value}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                                style.isActive 
                                  ? 'bg-green-500/20 text-green-300' 
                                  : 'bg-gray-700/50 text-gray-400'
                        }`}>
                          {style.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggleActive(style)}
                            className={`p-1 rounded-full ${
                              style.isActive 
                                      ? 'text-green-400 hover:bg-green-500/10' 
                                      : 'text-gray-500 hover:bg-gray-700/50'
                            }`}
                            title={style.isActive ? 'Deactivate' : 'Activate'}
                                  disabled={deletingStyle === style._id}
                          >
                            {style.isActive ? <Check size={18} /> : <X size={18} />}
                          </button>
                          <button
                            onClick={() => setEditingStyle(style)}
                                  className="p-1 rounded-full text-blue-400 hover:bg-blue-500/10"
                            title="Edit"
                                  disabled={deletingStyle === style._id}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteStyle(style._id)}
                                  className="p-1 rounded-full text-red-400 hover:bg-red-500/10"
                            title="Delete"
                                  disabled={deletingStyle === style._id}
                          >
                                  {deletingStyle === style._id ? (
                                    <span className="px-2 animate-pulse text-xs">Deleting...</span>
                                  ) : (
                            <Trash2 size={18} />
                                  )}
                          </button>
                        </div>
                      </td>
                          </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
            )}
      </div>
        </>
      )}
    </div>
  )
} 