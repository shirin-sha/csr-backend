/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react'
import styles from './FileUpload.module.css'
import { useForm } from "react-hook-form";

const FileUpload = ({ uploadHandler, ...props }) => {
	
	return (
		<div>

			<div className={styles.browseButtonWrap}>
				<input accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.jpg,.png" type="file" className={styles.customFileInput} onChange={uploadHandler} multiple {...props}
				
				/>
			</div>
		</div>
	)
}

export default FileUpload
