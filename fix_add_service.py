with open('admin/src/components/AddService/AddService.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
logic = '\n'.join(lines[:313])
jsx_body = '\n'.join(lines[314:])

full_code = f"""import React, {{ useState, useRef, useEffect }} from "react";
import {{
  Upload,
  Trash2,
  Plus,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Info,
  X,
}} from "lucide-react";
import {{ addServiceStyles }} from "../../assets/dummyStyles";

export default function AddService({{ serviceId = null }}) {{
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

{logic}

  return (
    <div className={{addServiceStyles.container.main}}>
      <style>{{addServiceStyles.customCSS}}</style>

      {{/* Toast Notification */}}
      {{toast && (
        <div className={{addServiceStyles.toast.container}}>
          <div
            className={{`${{addServiceStyles.toast.toastBase}} ${{
              toast.type === "error"
                ? addServiceStyles.toast.toastError
                : toast.type === "info"
                ? addServiceStyles.toast.toastInfo
                : addServiceStyles.toast.toastSuccess
            }}`}}
          >
            <div className={{addServiceStyles.toast.iconContainer(toast.type)}}>
              {{toast.type === "error" && <AlertCircle className="w-5 h-5" />}}
              {{toast.type === "info" && <Info className="w-5 h-5" />}}
              {{toast.type === "success" && <CheckCircle className="w-5 h-5" />}}
            </div>
            <div className="flex-1 min-w-0">
              <div className={{addServiceStyles.toast.title}}>{{toast.title}}</div>
              <div className={{addServiceStyles.toast.message}}>{{toast.message}}</div>
            </div>
            <button
              onClick={{() => setToast(null)}}
              className={{addServiceStyles.buttons.toastClose}}
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}}

      <form onSubmit={{handleSubmit}} className={{addServiceStyles.container.form}}>
        {{/* Header */}}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-emerald-100">
          <div>
            <h1 className={{addServiceStyles.header.title}}>
              {{serviceId ? "Update Diagnostic Service" : "Add Healthcare Service"}}
            </h1>
            <p className={{addServiceStyles.header.subtitle}}>
              Configure hospital diagnostic packages, pricing, instructions, and booking slots (PostgreSQL).
            </p>
          </div>

          <div className={{addServiceStyles.headerActions}}>
            <button
              type="button"
              onClick={{resetForm}}
              className={{addServiceStyles.buttons.reset}}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={{submitting}}
              className={{addServiceStyles.buttons.submit}}
            >
              {{submitting ? "Saving to PostgreSQL..." : (serviceId ? "Update Service" : "Save Service")}}
            </button>
          </div>
        </div>

        <div className={{addServiceStyles.grids.main}}>
          {{/* Left Column: Image */}}
          <div className="col-span-1 space-y-4">
            <div className={{addServiceStyles.imageUpload.container(Boolean(errors.image))}}>
              <div className={{addServiceStyles.imageUpload.preview}}>
                {{imagePreview ? (
                  <img
                    src={{imagePreview}}
                    alt="Service Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={{addServiceStyles.imageUpload.placeholder}}>
                    <Upload className="w-12 h-12 mb-2 text-emerald-400" />
                    <span className="text-xs text-emerald-600 font-medium">
                      Upload Service Photo
                    </span>
                  </div>
                )}}
              </div>

              <div className="flex items-center gap-2 w-full">
                <label className={{addServiceStyles.buttons.uploadImage + " cursor-pointer"}}>
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700 font-medium">Choose Image</span>
                  <input
                    ref={{fileRef}}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={{handleImageChange}}
                  />
                </label>

{jsx_body}

        <div className="mt-8 pt-6 border-t border-emerald-100 flex justify-end">
          <button
            type="submit"
            disabled={{submitting}}
            className={{addServiceStyles.buttons.submit + " text-base px-8 py-3"}}
          >
            {{submitting ? "Saving to PostgreSQL DB..." : (serviceId ? "Update Service" : "Create Service")}}
          </button>
        </div>
      </form>
    </div>
  );
}}
"""

with open('admin/src/components/AddService/AddService.jsx', 'w', encoding='utf-8') as f:
    f.write(full_code)
print("AddService.jsx written successfully")
