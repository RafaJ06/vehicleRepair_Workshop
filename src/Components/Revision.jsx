const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este vehículo?")) return;
    try {
      const response = await fetch(`${URL}/api/vehiculos/${id}`, { 
        method: 'DELETE', 
        headers: getAuthHeaders() 
      });
      
      handleAuthError(response.status);

      // 💡 VALIDACIÓN ESTRICTA: Si el backend rechaza la eliminación, lanzamos un error
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Error al intentar eliminar el vehículo. Verifica que no tenga órdenes de trabajo activas.');
      }

      // 💡 Si todo fue exitoso, lo quitamos de la pantalla
      setVehiculos(vehiculos.filter(v => v.id !== id));
      alert("Vehículo eliminado exitosamente.");
      
    } catch (err) { 
      // 💡 Ahora sí se mostrará el mensaje exacto de por qué no se puede borrar
      alert(`No se pudo eliminar: ${err.message}`); 
    }
  };