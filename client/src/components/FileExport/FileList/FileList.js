/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import React from 'react'
import FileItem from '../FileItem/FileItem'


const FileList = ({ files, removeFile }) => {
	const deleteFileHandler = (_name) => {
		console.log('file deletee')
		removeFile(_name)
	}
	return (
		<div >
			{
				files && (
					files.map((f, index) => {
						return (
							<FileItem
								key={f.name}
								file={f}
								deleteFile={deleteFileHandler}
							/>
						)
					}))
			}
		</div>
	)
}

export default FileList
