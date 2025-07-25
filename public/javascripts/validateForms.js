<!-- ✅ Load bs-custom-file-input library BEFORE this script -->
<script src="https://cdn.jsdelivr.net/npm/bs-custom-file-input/dist/bs-custom-file-input.min.js"></script>

<script>
  (function () {
    'use strict';

    // ✅ Initialize custom file input fields
    bsCustomFileInput.init();

    // ✅ Select all forms that need validation
    const forms = document.querySelectorAll('.validated-form');

    // ✅ Loop over each form and prevent submission if invalid
    Array.from(forms).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add('was-validated');
      }, false);
    });
  })();
</script>
