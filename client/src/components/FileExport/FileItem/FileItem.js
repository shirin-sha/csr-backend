/* eslint-disable react/prop-types */
import React from 'react'
import styles from './FileItem.module.css'

const FileItem = ({ file, deleteFile }) => {
	console.log(file)
	return (
		<div>
			<div className={styles.fileSelected}>
				<span>{file.name}</span>
				<div className={styles.actionButtons}>
					<span
						onClick={() => { deleteFile(file.name) }}
						onKeyDown={() => { deleteFile(file.name) }}
						role="button"
						tabIndex={-1}
					>
						Delete
					</span>
				</div>

			</div>
		</div>
	)
}

export default FileItem
