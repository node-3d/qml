{
	'variables': {
		'bin': '<!(node -p "require(\'@node-3d/addon-tools\').getBin()")',
		'qt_core_bin': '<!(node -p "require(\'@node-3d/deps-qmlui\').core.bin")',
		'qt_gui_bin': '<!(node -p "require(\'@node-3d/deps-qmlui\').gui.bin")',
		'qt_qml_bin': '<!(node -p "require(\'@node-3d/deps-qmlui\').qml.bin")',
		'qmlui_include': '<!(node -p "require(\'@node-3d/deps-qmlui\').include")',
		'qmlui_bin': '<!(node -p "require(\'@node-3d/deps-qmlui\').bin")',
	},
	'targets': [
		{
			'target_name': 'qml',
			'includes': ['common.gypi'],
			'sources': [
				'cpp/bindings.cpp',
				'cpp/view.cpp'
			],
			'include_dirs': [
				'<!@(node -e "import(\'@node-3d/addon-tools\').then((m) => m.printInclude())")',
				'<(qmlui_include)',
			],
			'library_dirs': ['<(qmlui_bin)'],
			'conditions': [
				['OS=="linux"', {
					'ldflags': [
						"-Wl,--disable-new-dtags",
						"-Wl,-rpath,'$$ORIGIN:$$ORIGIN/../node_modules/@node-3d/deps-qt-core/<(bin):$$ORIGIN/../node_modules/@node-3d/deps-qt-gui/<(bin):$$ORIGIN/../node_modules/@node-3d/deps-qt-qml/<(bin):$$ORIGIN/../node_modules/@node-3d/deps-qmlui/<(bin):$$ORIGIN/../../@node-3d/deps-qt-core/<(bin):$$ORIGIN/../../@node-3d/deps-qt-gui/<(bin):$$ORIGIN/../../@node-3d/deps-qt-qml/<(bin):$$ORIGIN/../../@node-3d/deps-qmlui/<(bin):$$ORIGIN/../../deps-qt-core/<(bin):$$ORIGIN/../../deps-qt-gui/<(bin):$$ORIGIN/../../deps-qt-qml/<(bin):$$ORIGIN/../../deps-qmlui/<(bin)'",
					],
					'libraries': [
						'<(qmlui_bin)/libqmlui.so',
					],
				}],
				
				['OS=="mac"', {
					'target_arch': 'arm',
					'libraries': [
						'<(qmlui_bin)/libqmlui.dylib',
						'-Wl,-rpath,@loader_path',
						'-Wl,-rpath,@loader_path/../node_modules/@node-3d/deps-qt-core/<(bin)',
						'-Wl,-rpath,@loader_path/../node_modules/@node-3d/deps-qt-gui/<(bin)',
						'-Wl,-rpath,@loader_path/../node_modules/@node-3d/deps-qt-qml/<(bin)',
						'-Wl,-rpath,@loader_path/../node_modules/@node-3d/deps-qmlui/<(bin)',
						'-Wl,-rpath,@loader_path/../../@node-3d/deps-qt-core/<(bin)',
						'-Wl,-rpath,@loader_path/../../@node-3d/deps-qt-gui/<(bin)',
						'-Wl,-rpath,@loader_path/../../@node-3d/deps-qt-qml/<(bin)',
						'-Wl,-rpath,@loader_path/../../@node-3d/deps-qmlui/<(bin)',
						'-Wl,-rpath,@loader_path/../../deps-qt-core/<(bin)',
						'-Wl,-rpath,@loader_path/../../deps-qt-gui/<(bin)',
						'-Wl,-rpath,@loader_path/../../deps-qt-qml/<(bin)',
						'-Wl,-rpath,@loader_path/../../deps-qmlui/<(bin)',
					],
				}],
				
				['OS=="win"', {
					'libraries': ['-lqmlui'],
				}],
				
			],
		},
	]
}
