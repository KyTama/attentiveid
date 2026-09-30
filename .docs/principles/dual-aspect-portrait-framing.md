# Dual-Aspect Portrait Framing & Facial Landmark Calibration

**When this applies:**
Cropping and normalizing headshot/portrait media assets intended for display across multiple layout containers with differing aspect ratios — specifically full vertical portraits (e.g. 4:5 in profiles) and wide card viewports (e.g. 1.65:1 in directory listings with `object-cover`).

**Principle:**
Anchor horizontal centering to the subject's facial landmarks (hair part, eye pupil midpoint, nose bridge) rather than torso bounds or arm posture, and calibrate the crop box against the most restrictive container.

**Why:**
In casual or seated studio poses where subjects cross their arms or lean slightly, the overall body bounding box is asymmetric. Shifting crop windows based on shoulder or torso width pushes the face noticeably off-center when viewed inside widescreen card containers that truncate the lower body.

**How to apply:**
1. **Locate Facial Midline**: Measure the $x$-coordinates of the facial midline (hair parting line, nose bridge, eyes midpoint). Ensure this midline aligns with the horizontal center ($x = W / 2$) of the target canvas.
2. **Dual-Container Simulation**: Before exporting, simulate both the unclipped full portrait ($4:5$) and the cropped card container (e.g. $1.65:1$ with `object-[center_22%]`) to ensure natural margins and zero visual crowding.
3. **Preserve Verified High-Res Close-Ups**: When a subject already has an existing well-framed portrait asset, reuse that asset rather than downsampling/re-cropping full-body sitting shots that risk stretching or distortion.
4. **Container-Asset Ratio Convergence**: When recurring micro-crop friction occurs across differing page layouts, converge the UI container's aspect ratio (e.g. updating cards from `1.65/1` to `4/5`) to achieve 1:1 parity with the master media asset. This eliminates artificial cropping, preserves clinical body language, and removes per-photo CSS overrides.

